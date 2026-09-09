import { ALLOCATION_WEIGHTS } from '../shared/contracts.js';

/**
 * Stage 3: Multi-Criteria Ranking Engine
 * Computes exact composite scores based on booking type:
 * - Scheduled: 60% utilization, 20% rating, 20% distance + 0.08 same-cooperative bonus
 * - Emergency: 70% distance, 20% rating, 10% utilization (no coop bonus)
 */
export function rankCandidate({
  worker,
  workerProfile,
  distanceKm,
  searchRadiusKm,
  bookingType,
  bookingCooperativeId,
  hoursWorkedToday = null,
  hoursAvailableToday = 8.0
}) {
  // 1. Calculate Component Scores
  // Utilization: 1 - (worked / available)
  const actualWorkedHours = hoursWorkedToday !== null 
    ? hoursWorkedToday 
    : (worker.fairnessMetrics?.weeklyAssignedHours ? (worker.fairnessMetrics.weeklyAssignedHours / 5) : 0);
  
  const availableHours = Math.max(hoursAvailableToday || 8.0, 1.0);
  const utilizationRatio = Math.min(1.0, Math.max(0.0, actualWorkedHours / availableHours));
  const utilizationScore = Math.round((1.0 - utilizationRatio) * 1000) / 1000;

  // Rating: rating / 5.0
  const rawRating = worker.rating?.average || 5.0;
  const ratingScore = Math.round((Math.min(5.0, Math.max(1.0, rawRating)) / 5.0) * 1000) / 1000;

  // Distance: 1 - (distanceKm / searchRadiusKm)
  const radius = Math.max(searchRadiusKm, 0.1);
  const distRatio = Math.min(1.0, Math.max(0.0, distanceKm / radius));
  const distanceScore = Math.round((1.0 - distRatio) * 1000) / 1000;

  // Cooperative Affiliation Check
  const isSameCooperative = String(worker.cooperativeId) === String(bookingCooperativeId);

  let compositeScore = 0;
  let finalScore = 0;
  let cooperativeBonus = 0;
  let explainabilitySummary = '';
  const workerName = workerProfile?.fullName || worker.badgeNumber || 'Worker';

  if (bookingType === 'SCHEDULED') {
    // Scheduled formula: 0.6 * utilization + 0.2 * rating + 0.2 * distance
    const w = ALLOCATION_WEIGHTS.SCHEDULED;
    compositeScore = (w.UTILIZATION * utilizationScore) + (w.RATING * ratingScore) + (w.DISTANCE * distanceScore);
    cooperativeBonus = isSameCooperative ? w.SAME_COOP_BONUS : 0.0;
    finalScore = compositeScore + cooperativeBonus;

    compositeScore = Math.round(compositeScore * 10000) / 10000;
    finalScore = Math.round(finalScore * 10000) / 10000;

    explainabilitySummary = 
      `[SCHEDULED DISPATCH: Workload Balance & Anti-Burnout Prioritized] ${workerName} [${worker.badgeNumber}]: Final Score ${finalScore} ` +
      `(Workload Balance ${utilizationScore} [worked ${actualWorkedHours.toFixed(1)}h/${availableHours}h] × 60% = ${(w.UTILIZATION * utilizationScore).toFixed(3)}, ` +
      `Rating ${ratingScore} [${rawRating.toFixed(1)}★] × 20% = ${(w.RATING * ratingScore).toFixed(3)}, ` +
      `Distance ${distanceScore} [${distanceKm.toFixed(1)}km/${radius}km] × 20% = ${(w.DISTANCE * distanceScore).toFixed(3)}` +
      `${isSameCooperative ? ` + 0.08 Local Coop Bonus` : ''}). ` +
      `Workload balance prioritized for cooperative fairness.`;

  } else {
    // Emergency formula: 0.7 * distance + 0.2 * rating + 0.1 * utilization (no coop bonus)
    const w = ALLOCATION_WEIGHTS.EMERGENCY;
    compositeScore = (w.DISTANCE * distanceScore) + (w.RATING * ratingScore) + (w.UTILIZATION * utilizationScore);
    cooperativeBonus = 0.0; // Never applied to emergency
    finalScore = compositeScore;

    compositeScore = Math.round(compositeScore * 10000) / 10000;
    finalScore = Math.round(finalScore * 10000) / 10000;

    explainabilitySummary = 
      `[EMERGENCY DISPATCH: Nearest Proximity Worker Prioritized] ${workerName} [${worker.badgeNumber}]: Final Score ${finalScore} ` +
      `(Distance ${distanceScore} [${distanceKm.toFixed(1)}km] × 70% = ${(w.DISTANCE * distanceScore).toFixed(3)}, ` +
      `Rating ${ratingScore} [${rawRating.toFixed(1)}★] × 20% = ${(w.RATING * ratingScore).toFixed(3)}, ` +
      `Utilization ${utilizationScore} × 10% = ${(w.UTILIZATION * utilizationScore).toFixed(3)}). ` +
      `Rapid proximity response prioritized for emergency dispatch.`;
  }

  return {
    workerId: worker._id,
    scores: {
      rankingCriteria: bookingType === 'EMERGENCY' ? 'NEAREST_WORKER' : 'FAIRNESS_WORKLOAD',
      distanceKm,
      distanceScore,
      ratingScore,
      utilizationScore,
      hoursWorkedToday: actualWorkedHours,
      hoursAvailableToday: availableHours,
      isSameCooperative,
      cooperativeBonus,
      compositeScore,
      finalScore
    },
    explainabilitySummary
  };
}
