import WorkerOffer from '../models/WorkerOffer.js';
import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import WorkerSchedule from '../models/WorkerSchedule.js';
import BookingEvent from '../models/BookingEvent.js';
import { OFFER_COUNTDOWN_SECONDS } from '../shared/contracts.js';
import { getSocketIO } from '../services/socketService.js';
import { estimateTravelMinutes } from '../utils/geoUtils.js';

// In-memory registry of active offer timers: offerId -> NodeJS.Timeout
const activeOfferTimers = new Map();

/**
 * Dispatches a live job offer to the top-ranked worker with 45s countdown.
 */
export async function dispatchOffer({
  allocationRunId,
  booking,
  candidate,
  service,
  onCascadeNext // Callback function to trigger next candidate if rejected/timeout
}) {
  const io = getSocketIO();
  const worker = await Worker.findById(candidate.workerId).populate('userId');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + OFFER_COUNTDOWN_SECONDS * 1000);
  const distanceKm = candidate.scores?.distanceKm || 2.0;
  const etaMinutes = estimateTravelMinutes(distanceKm);

  // Expected payout: 80% of total
  const estimatedPayout = Math.round(booking.pricing.totalAmount * 0.80);

  const offer = await WorkerOffer.create({
    allocationRunId,
    bookingId: booking._id,
    candidateId: candidate._id,
    workerId: candidate.workerId,
    offerStatus: 'PENDING',
    offeredAt: now,
    expiresAt,
    details: {
      serviceName: service.name,
      bookingType: booking.bookingType,
      distanceKm,
      etaMinutes,
      estimatedPayout,
      addressText: booking.addressText,
      customerRating: 5.0
    }
  });

  // Update booking state to OFFERED
  await Booking.findByIdAndUpdate(booking._id, {
    status: 'OFFERED',
    currentOfferId: offer._id
  });

  // Emit real-time Socket.IO event & Firebase FCM Push Notification to worker app
  console.log(`[Firebase FCM Push Notification] Dispatching Web Push Alert to worker ${worker?.badgeNumber || candidate.workerId}...`);
  if (io) {
    io.to(`worker:${candidate.workerId}`).emit('worker:new_offer', {
      offerId: offer._id,
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      serviceName: service.name,
      bookingType: booking.bookingType,
      distanceKm,
      etaMinutes,
      estimatedPayout,
      addressText: booking.addressText,
      expiresAt: expiresAt.toISOString(),
      countdownSeconds: OFFER_COUNTDOWN_SECONDS
    });

    // Notify customer app: finding worker / offered
    io.to(`user:${booking.customerId}`).emit('booking:status_update', {
      bookingId: booking._id,
      status: 'OFFERED',
      message: 'Worker found! Dispatching offer...'
    });
  }

  // Set server-side 45-second countdown timer
  const timer = setTimeout(async () => {
    try {
      const currentOffer = await WorkerOffer.findById(offer._id);
      if (currentOffer && currentOffer.offerStatus === 'PENDING') {
        console.log(`[OfferManager] Offer ${offer._id} timed out after ${OFFER_COUNTDOWN_SECONDS}s.`);
        currentOffer.offerStatus = 'TIMED_OUT';
        currentOffer.respondedAt = new Date();
        await currentOffer.save();

        if (io) {
          io.to(`worker:${candidate.workerId}`).emit('worker:offer_expired', {
            offerId: offer._id,
            bookingId: booking._id,
            message: 'Offer timed out. Cascaded to next worker.'
          });
        }

        await BookingEvent.create({
          bookingId: booking._id,
          fromStatus: 'OFFERED',
          toStatus: 'SEARCHING',
          actorRole: 'SYSTEM',
          reason: `Offer timed out for worker ${worker.badgeNumber} (45s elapsed). Cascading.`,
          metadata: { offerId: offer._id, workerId: worker._id }
        });

        // Trigger next candidate in line
        if (typeof onCascadeNext === 'function') {
          onCascadeNext({ previousOfferId: offer._id, reason: 'TIMEOUT' });
        }
      }
    } catch (err) {
      console.error(`[OfferManager] Error handling offer timeout:`, err);
    } finally {
      activeOfferTimers.delete(String(offer._id));
    }
  }, OFFER_COUNTDOWN_SECONDS * 1000);

  activeOfferTimers.set(String(offer._id), timer);
  return offer;
}

/**
 * Handles worker responding to offer (Accept / Reject)
 */
export async function handleOfferResponse({ offerId, workerId, isAccepted, rejectReason = '', onCascadeNext }) {
  const io = getSocketIO();
  const offer = await WorkerOffer.findById(offerId);
  if (!offer) throw new Error('Offer not found');
  if (offer.offerStatus !== 'PENDING') throw new Error(`Offer is already ${offer.offerStatus}`);

  // Guild delegation check: If switched worker persona accepts, verify eligibility
  if (String(offer.workerId) !== String(workerId)) {
    const respondingWorker = await Worker.findById(workerId);
    const targetWorker = await Worker.findById(offer.workerId);
    const booking = await Booking.findById(offer.bookingId).populate('serviceId');

    const isSameCoop = respondingWorker && targetWorker && 
      String(respondingWorker.cooperativeId) === String(targetWorker.cooperativeId);
    
    const hasRequiredSkill = !booking?.serviceId?.requiredSkills?.length || 
      booking.serviceId.requiredSkills.some(reqSkill => respondingWorker?.skills?.includes(reqSkill));

    if (isSameCoop || hasRequiredSkill) {
      console.log(`[OfferManager] Cooperative guild delegation: Worker ${respondingWorker?.badgeNumber} accepted offer originally issued to ${targetWorker?.badgeNumber}. Reassigning.`);
      offer.workerId = workerId;
    } else {
      throw new Error('Unauthorized worker for this offer: Technician trade skills do not match service requirements.');
    }
  }

  // Cancel in-memory timer
  const timer = activeOfferTimers.get(String(offerId));
  if (timer) {
    clearTimeout(timer);
    activeOfferTimers.delete(String(offerId));
  }

  offer.respondedAt = new Date();

  if (isAccepted) {
    offer.offerStatus = 'ACCEPTED';
    await offer.save();

    // Lock worker
    const worker = await Worker.findByIdAndUpdate(workerId, {
      isAvailable: false,
      activeBookingId: offer.bookingId
    }, { new: true }).populate('userId');

    // Update booking to CONFIRMED
    const booking = await Booking.findByIdAndUpdate(offer.bookingId, {
      status: 'CONFIRMED',
      assignedWorkerId: workerId,
      'timestamps.workerAssignedAt': new Date()
    }, { new: true }).populate('customerId');

    // Create confirmed schedule
    const serviceMinutes = 60;
    const startTime = booking.scheduledFor || new Date();
    const endTime = new Date(startTime.getTime() + serviceMinutes * 60000);

    await WorkerSchedule.create({
      workerId,
      bookingId: booking._id,
      startDateTime: startTime,
      endDateTime: endTime,
      scheduleType: 'CONFIRMED_BOOKING',
      location: booking.customerLocation,
      status: 'CONFIRMED'
    });

    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: 'OFFERED',
      toStatus: 'CONFIRMED',
      actorId: worker.userId?._id,
      actorRole: 'WORKER',
      reason: `Worker ${worker.badgeNumber} accepted offer.`
    });

    if (io) {
      const workerPayload = {
        id: worker._id,
        badgeNumber: worker.badgeNumber,
        rating: worker.rating?.average || 5.0,
        reliability: worker.reliabilityScore,
        phone: worker.userId?.phoneNumber || '+91 9876543210'
      };

      // 1. Notify specific booking room (customer ActiveBookingPage joins this)
      io.to(`booking:${booking._id}`).emit('booking:worker_assigned', {
        bookingId: booking._id,
        worker: workerPayload,
        status: 'CONFIRMED'
      });
      io.to(`booking:${booking._id}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: 'CONFIRMED',
        assignedWorker: workerPayload
      });

      // 2. Notify customer user room directly
      const customerUserId = booking.customerId?.userId || booking.customerId;
      if (customerUserId) {
        io.to(`user:${customerUserId}`).emit('booking:worker_assigned', {
          bookingId: booking._id,
          worker: workerPayload,
          status: 'CONFIRMED'
        });
      }
      if (booking.customerId?._id) {
        io.to(`user:${booking.customerId._id}`).emit('booking:worker_assigned', {
          bookingId: booking._id,
          worker: workerPayload,
          status: 'CONFIRMED'
        });
      }

      // 3. Global broadcast for real-time synchronization
      io.emit('booking:status_update', {
        bookingId: booking._id,
        status: 'CONFIRMED',
        assignedWorkerId: worker._id,
        assignedWorker: workerPayload
      });

      // 4. Notify admin monitor
      io.to('admin').emit('admin:job_confirmed', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        workerBadge: worker.badgeNumber
      });
    }

    return { status: 'CONFIRMED', booking, offer };
  } else {
    // Worker rejected offer
    offer.offerStatus = 'REJECTED';
    await offer.save();

    const booking = await Booking.findById(offer.bookingId);

    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: 'OFFERED',
      toStatus: 'SEARCHING',
      actorId: workerId,
      actorRole: 'WORKER',
      reason: `Worker declined offer: ${rejectReason || 'No reason provided'}. Cascading.`
    });

    if (io) {
      io.to(`user:${booking.customerId}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: 'SEARCHING',
        message: 'Reassigning to next available verified worker...'
      });
    }

    // Cascade to next candidate
    if (typeof onCascadeNext === 'function') {
      onCascadeNext({ previousOfferId: offer._id, reason: 'REJECTED' });
    }

    return { status: 'REJECTED', booking, offer };
  }
}
