import AllocationRun from '../models/AllocationRun.js';
import AllocationCandidate from '../models/AllocationCandidate.js';

/**
 * Stage 4: Allocation Auditor
 * Creates transparent, explainable audit records of candidates, scores, and exclusion reasons.
 */
export async function logAllocationRun({
  bookingId,
  runNumber,
  triggerReason,
  radiusKm,
  searchStage,
  candidates,        // Array of evaluated candidates (both eligible and excluded)
  selectedWorkerId = null,
  status = 'CANDIDATE_OFFERED'
}) {
  try {
    const eligibleCount = candidates.filter(c => !c.isExcluded).length;
    const excludedCount = candidates.filter(c => c.isExcluded).length;

    const run = await AllocationRun.create({
      bookingId,
      runNumber,
      triggerReason,
      radiusKm,
      searchStage,
      totalEvaluated: candidates.length,
      eligibleCount,
      excludedCount,
      selectedWorkerId,
      status
    });

    const candidateDocs = candidates.map((c, index) => ({
      allocationRunId: run._id,
      bookingId,
      workerId: c.workerId,
      rank: c.isExcluded ? 999 : (c.rank || index + 1),
      isExcluded: !!c.isExcluded,
      exclusionReasons: c.exclusionReasons || [],
      scores: c.scores || {},
      explainabilitySummary: c.explainabilitySummary || ''
    }));

    if (candidateDocs.length > 0) {
      await AllocationCandidate.insertMany(candidateDocs);
    }

    return run;
  } catch (err) {
    console.error(`[AllocationAuditor] Error logging allocation run:`, err);
    return null;
  }
}
