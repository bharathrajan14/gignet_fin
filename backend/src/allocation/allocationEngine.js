import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import BookingEvent from '../models/BookingEvent.js';
import { SEARCH_RADII } from '../shared/contracts.js';
import { findWorkersInRadius } from './geoSearch.js';
import { evaluateHardFilter } from './hardFilter.js';
import { rankCandidate } from './rankingEngine.js';
import { logAllocationRun } from './allocationAuditor.js';
import { dispatchOffer } from './offerManager.js';
import { getSocketIO } from '../services/socketService.js';

/**
 * Master Allocation Engine
 * Coordinates Hard Filter -> Progressive Geo Expansion -> Multi-Criteria Ranking -> Offer Dispatch
 */
export async function runAllocation(bookingId, { radiusIndex = 0, candidateIndex = 0, triggerReason = 'INITIAL_SEARCH' } = {}) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.error(`[AllocationEngine] Booking ${bookingId} not found.`);
    return;
  }

  // Only allocate if booking is in SEARCHING or DRAFT
  if (!['DRAFT', 'SEARCHING', 'OFFERED'].includes(booking.status)) {
    console.log(`[AllocationEngine] Booking ${booking.bookingNumber} is in status ${booking.status}. Skipping.`);
    return;
  }

  const service = await Service.findById(booking.serviceId);
  if (!service) {
    console.error(`[AllocationEngine] Service ${booking.serviceId} not found.`);
    return;
  }

  // Determine progressive radius sequence
  const radii = booking.bookingType === 'EMERGENCY'
    ? SEARCH_RADII.EMERGENCY // [3, 6, 12, 15] km
    : SEARCH_RADII.SCHEDULED; // [2, 5, 10, 15] km

  if (radiusIndex >= radii.length) {
    // All radii exhausted!
    console.warn(`[AllocationEngine] All search radii exhausted for booking ${booking.bookingNumber}.`);
    await Booking.findByIdAndUpdate(booking._id, { status: 'SEARCHING' });
    
    const io = getSocketIO();
    if (io) {
      io.to('admin').emit('admin:sla_alert', {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        bookingType: booking.bookingType,
        message: `All search radii (${radii.join(', ')} km) exhausted with zero eligible workers. Immediate manual or cross-cooperative dispatch required!`
      });
      io.to(`user:${booking.customerId}`).emit('booking:status_update', {
        bookingId: booking._id,
        status: 'SEARCHING',
        message: 'High demand in your area. Expanding search to regional cooperative workforce...'
      });
    }

    await BookingEvent.create({
      bookingId: booking._id,
      fromStatus: 'SEARCHING',
      toStatus: 'SEARCHING',
      actorRole: 'SYSTEM',
      reason: 'All progressive search radii exhausted. Escalated to cooperative administrator.',
      metadata: { radiiEvaluated: radii }
    });
    return;
  }

  const currentRadiusKm = radii[radiusIndex];
  const radiusMeters = currentRadiusKm * 1000;
  const searchStage = `RADIUS_${currentRadiusKm}KM`;

  console.log(`[AllocationEngine] Evaluating booking ${booking.bookingNumber} [${booking.bookingType}] at stage ${searchStage} (${currentRadiusKm}km)...`);

  // Update booking to SEARCHING
  await Booking.findByIdAndUpdate(booking._id, {
    status: 'SEARCHING',
    'timestamps.searchingStartedAt': booking.timestamps?.searchingStartedAt || new Date()
  });

  // Query workers in radius
  const rawCandidates = await findWorkersInRadius(booking.customerLocation.coordinates, radiusMeters);

  const evaluatedCandidates = [];

  for (const item of rawCandidates) {
    // 1. Hard Filter
    const hardFilterResult = await evaluateHardFilter({
      worker: item.worker,
      service,
      subSkillId: booking.subSkillId,
      bookingType: booking.bookingType,
      customerLocation: booking.customerLocation.coordinates,
      workerLocation: item.workerLocation,
      scheduledForDate: booking.scheduledFor,
      cooperativeId: booking.cooperativeId
    });

    if (!hardFilterResult.isPassed) {
      evaluatedCandidates.push({
        workerId: item.worker._id,
        isExcluded: true,
        exclusionReasons: hardFilterResult.exclusionReasons,
        scores: { distanceKm: item.distanceKm },
        explainabilitySummary: `Excluded: ${hardFilterResult.exclusionReasons.join('; ')}`
      });
      continue;
    }

    // 2. Multi-Criteria Ranking
    const rankingResult = rankCandidate({
      worker: item.worker,
      workerProfile: item.workerProfile,
      distanceKm: item.distanceKm,
      searchRadiusKm: currentRadiusKm,
      bookingType: booking.bookingType,
      bookingCooperativeId: booking.cooperativeId
    });

    evaluatedCandidates.push({
      workerId: item.worker._id,
      isExcluded: false,
      exclusionReasons: [],
      scores: rankingResult.scores,
      explainabilitySummary: rankingResult.explainabilitySummary
    });
  }

  // Filter and sort eligible candidates by finalScore descending
  const eligibleCandidates = evaluatedCandidates
    .filter(c => !c.isExcluded)
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore);

  // Assign ranks
  eligibleCandidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  if (eligibleCandidates.length === 0) {
    // Zero eligible workers in this radius -> Log run and expand to next radius
    console.log(`[AllocationEngine] 0 eligible workers at ${currentRadiusKm}km. Expanding to next radius...`);
    await logAllocationRun({
      bookingId: booking._id,
      runNumber: radiusIndex + 1,
      triggerReason,
      radiusKm: currentRadiusKm,
      searchStage,
      candidates: evaluatedCandidates,
      status: 'EXHAUSTED_NEED_EXPANSION'
    });

    return await runAllocation(bookingId, {
      radiusIndex: radiusIndex + 1,
      candidateIndex: 0,
      triggerReason: 'RADIUS_EXPANSION'
    });
  }

  // Top candidate chosen for current rank
  const selectedCandidate = eligibleCandidates[candidateIndex] || eligibleCandidates[0];

  const run = await logAllocationRun({
    bookingId: booking._id,
    runNumber: radiusIndex + 1,
    triggerReason,
    radiusKm: currentRadiusKm,
    searchStage,
    candidates: evaluatedCandidates,
    selectedWorkerId: selectedCandidate.workerId,
    status: 'CANDIDATE_OFFERED'
  });

  console.log(`[AllocationEngine] Dispatching offer to top candidate ${selectedCandidate.workerId} (Rank ${selectedCandidate.rank}).`);

  // Dispatch offer with 45s countdown and cascade callback
  await dispatchOffer({
    allocationRunId: run._id,
    booking,
    candidate: selectedCandidate,
    service,
    onCascadeNext: async ({ previousOfferId, reason }) => {
      console.log(`[AllocationEngine] Cascade triggered for booking ${booking.bookingNumber}. Reason: ${reason}`);
      const nextCandidateIndex = candidateIndex + 1;

      if (nextCandidateIndex < eligibleCandidates.length) {
        // Offer candidate #2, #3 in current pool
        await runAllocation(bookingId, {
          radiusIndex,
          candidateIndex: nextCandidateIndex,
          triggerReason: reason === 'TIMEOUT' ? 'OFFER_TIMEOUT' : 'OFFER_REJECTED'
        });
      } else {
        // Current radius candidates exhausted, expand radius!
        console.log(`[AllocationEngine] Candidates in radius ${currentRadiusKm}km exhausted. Expanding radius.`);
        await runAllocation(bookingId, {
          radiusIndex: radiusIndex + 1,
          candidateIndex: 0,
          triggerReason: 'RADIUS_EXPANSION'
        });
      }
    }
  });
}
