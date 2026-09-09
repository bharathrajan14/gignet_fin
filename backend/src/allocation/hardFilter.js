import WorkerSchedule from '../models/WorkerSchedule.js';
import { ALLOCATION_WEIGHTS } from '../shared/contracts.js';
import { calculateDistanceKm, estimateTravelMinutes } from '../utils/geoUtils.js';

/**
 * Stage 1: Hard Filtering Gate
 * Evaluates whether a worker satisfies mandatory criteria for a service booking.
 * Implements the Ravi/Kumar dynamic slack calculation for emergency bookings.
 */
export async function evaluateHardFilter({
  worker,
  service,
  bookingType,
  customerLocation, // [lon, lat]
  workerLocation,   // [lon, lat]
  scheduledForDate = null,
  cooperativeId = null
}) {
  const exclusionReasons = [];

  // 1. KYC Verification Check
  if (worker.kycStatus !== 'VERIFIED') {
    exclusionReasons.push(`KYC_NOT_VERIFIED: Status is ${worker.kycStatus}`);
  }

  // 2. Online & Available Status
  if (!worker.isOnline) {
    exclusionReasons.push('WORKER_OFFLINE: Worker is currently offline');
  }
  if (!worker.isAvailable) {
    exclusionReasons.push('WORKER_UNAVAILABLE: Worker is marked unavailable');
  }
  if (worker.activeBookingId) {
    exclusionReasons.push('ACTIVE_BOOKING_IN_PROGRESS: Worker is currently engaged on an active job');
  }

  // 3. Mandatory Skill Match Check
  if (service.requiredSkills && service.requiredSkills.length > 0) {
    const workerSkills = new Set(worker.skills || []);
    const missingSkills = service.requiredSkills.filter(s => !workerSkills.has(s));
    if (missingSkills.length > 0) {
      exclusionReasons.push(`SKILL_MISMATCH: Missing required skills [${missingSkills.join(', ')}]`);
    }
  }

  // 4. Mandatory Certification Check (e.g. Electrical high voltage, gas line)
  if (service.requiredCertifications && service.requiredCertifications.length > 0) {
    const validCerts = new Set(
      (worker.certifications || [])
        .filter(c => c.isVerified && new Date(c.expiryDate) > new Date())
        .map(c => c.code)
    );
    const missingCerts = service.requiredCertifications.filter(c => !validCerts.has(c));
    if (missingCerts.length > 0) {
      exclusionReasons.push(`CERTIFICATION_MISMATCH: Missing active certification [${missingCerts.join(', ')}]`);
    }
  }

  // 5. Schedule Conflict / Dynamic Slack Gate
  const now = new Date();
  const emergencyDurationEstimate = service.estimatedDurationMinutes || 45;

  if (bookingType === 'EMERGENCY') {
    // Check upcoming confirmed bookings for this worker today
    const nextBooking = await WorkerSchedule.findOne({
      workerId: worker._id,
      scheduleType: 'CONFIRMED_BOOKING',
      startDateTime: { $gte: now },
      status: 'CONFIRMED'
    }).sort({ startDateTime: 1 });

    if (nextBooking) {
      // RAVI / KUMAR MECHANISM:
      // Worker is NOT blocked outright — evaluate slack:
      // slack = minutesUntilConfirmed - (emergencyDuration + travelToEmergency + travelBackToConfirmed)
      const minutesUntilConfirmed = Math.round((new Date(nextBooking.startDateTime).getTime() - now.getTime()) / 60000);
      
      const distToEmergency = calculateDistanceKm(
        workerLocation[0], workerLocation[1],
        customerLocation[0], customerLocation[1]
      );
      const travelToEmergency = estimateTravelMinutes(distToEmergency);

      const confirmedCoords = nextBooking.location?.coordinates || workerLocation;
      const distEmergencyToConfirmed = calculateDistanceKm(
        customerLocation[0], customerLocation[1],
        confirmedCoords[0], confirmedCoords[1]
      );
      const travelBackToConfirmed = estimateTravelMinutes(distEmergencyToConfirmed);

      const totalRequiredMinutes = emergencyDurationEstimate + travelToEmergency + travelBackToConfirmed;
      const slack = minutesUntilConfirmed - totalRequiredMinutes;

      if (slack < ALLOCATION_WEIGHTS.SAFETY_BUFFER_MIN) {
        exclusionReasons.push(
          `SCHEDULE_SLACK_VIOLATION (Ravi/Kumar Rule): Next booking in ${minutesUntilConfirmed}m. ` +
          `Required time: ${totalRequiredMinutes}m (${emergencyDurationEstimate}m job + ${travelToEmergency}m travel + ` +
          `${travelBackToConfirmed}m transit). Slack is ${slack}m (< ${ALLOCATION_WEIGHTS.SAFETY_BUFFER_MIN}m required buffer).`
        );
      }
    }
  } else if (bookingType === 'SCHEDULED' && scheduledForDate) {
    // Scheduled booking conflict check: check for overlap
    const jobStart = new Date(scheduledForDate);
    const jobEnd = new Date(jobStart.getTime() + (service.estimatedDurationMinutes || 60) * 60000);

    const conflictingBooking = await WorkerSchedule.findOne({
      workerId: worker._id,
      scheduleType: 'CONFIRMED_BOOKING',
      status: 'CONFIRMED',
      $or: [
        { startDateTime: { $lt: jobEnd, $gte: jobStart } },
        { endDateTime: { $gt: jobStart, $lte: jobEnd } },
        { startDateTime: { $lte: jobStart }, endDateTime: { $gte: jobEnd } }
      ]
    });

    if (conflictingBooking) {
      exclusionReasons.push(
        `SCHEDULE_OVERLAP: Conflicting appointment already booked between ` +
        `${conflictingBooking.startDateTime.toLocaleTimeString()} and ${conflictingBooking.endDateTime.toLocaleTimeString()}`
      );
    }
  }

  const isPassed = exclusionReasons.length === 0;

  return {
    isPassed,
    exclusionReasons
  };
}
