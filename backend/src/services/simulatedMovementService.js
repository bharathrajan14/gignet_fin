import { getSocketIO } from './socketService.js';
import WorkerLocation from '../models/WorkerLocation.js';
import { calculateDistanceKm, estimateTravelMinutes, toH3 } from '../utils/geoUtils.js';

const activeSimulations = new Map();

/**
 * Deterministic Simulated Movement Service
 * Architecturally separated from real GPS device handling.
 * Steps worker coordinates along 5 waypoints towards customer over ~10-12 seconds.
 */
export function startSimulatedMovement({ bookingId, workerId, originCoords, destinationCoords }) {
  const io = getSocketIO();
  if (activeSimulations.has(String(bookingId))) {
    clearInterval(activeSimulations.get(String(bookingId)));
  }

  const [lonA, latA] = originCoords;
  const [lonB, latB] = destinationCoords;

  const totalSteps = 5;
  let currentStep = 0;

  console.log(`[SimulatedMovement] Starting simulated tracking for booking ${bookingId} (Worker ${workerId})`);

  const interval = setInterval(async () => {
    currentStep++;
    const progress = currentStep / totalSteps;

    // Linear interpolation
    const currentLon = lonA + (lonB - lonA) * progress;
    const currentLat = latA + (latB - latA) * progress;

    const remainingKm = calculateDistanceKm(currentLon, currentLat, lonB, latB);
    const etaMinutes = estimateTravelMinutes(remainingKm);

    try {
      // Update WorkerLocation document with isSimulated flag
      await WorkerLocation.findOneAndUpdate(
        { workerId },
        {
          location: { type: 'Point', coordinates: [currentLon, currentLat] },
          h3Res7: toH3(currentLat, currentLon, 7),
          h3Res8: toH3(currentLat, currentLon, 8),
          speed: 28, // ~28 km/h simulated urban speed
          isSimulated: true,
          updatedAt: new Date()
        },
        { upsert: true }
      );

      const tickData = {
        bookingId,
        workerId,
        coordinates: [currentLon, currentLat],
        remainingKm,
        etaMinutes,
        isSimulated: true,
        progressPct: Math.round(progress * 100)
      };

      if (io) {
        io.to(`booking:${bookingId}`).emit('worker:location_tick', tickData);
        io.to('admin').emit('worker:location_tick', tickData);
      }

      console.log(`[SimulatedMovement] Booking ${bookingId} Step ${currentStep}/${totalSteps}: ${remainingKm}km remaining (ETA ${etaMinutes}m)`);

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        activeSimulations.delete(String(bookingId));
        console.log(`[SimulatedMovement] Worker reached destination for booking ${bookingId}`);

        if (io) {
          io.to(`booking:${bookingId}`).emit('worker:simulated_arrival', {
            bookingId,
            workerId,
            message: 'Worker has arrived at customer location!'
          });
        }
      }
    } catch (err) {
      console.error(`[SimulatedMovement] Error in simulation tick:`, err);
    }
  }, 2500); // 2.5s per waypoint

  activeSimulations.set(String(bookingId), interval);
}

export function stopSimulatedMovement(bookingId) {
  if (activeSimulations.has(String(bookingId))) {
    clearInterval(activeSimulations.get(String(bookingId)));
    activeSimulations.delete(String(bookingId));
    console.log(`[SimulatedMovement] Stopped simulation for booking ${bookingId}`);
  }
}
