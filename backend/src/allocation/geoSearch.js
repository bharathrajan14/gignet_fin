import WorkerLocation from '../models/WorkerLocation.js';
import { calculateDistanceKm } from '../utils/geoUtils.js';

/**
 * Stage 2: Progressive Geo Spatial Search
 * Queries worker locations within radiusMeters using MongoDB's native 2dsphere index
 * with automatic fallback if in-memory test indexes are still synchronizing.
 */
export async function findWorkersInRadius(customerCoords, radiusMeters) {
  try {
    let results;
    try {
      results = await WorkerLocation.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: customerCoords
            },
            distanceField: 'distanceMeters',
            maxDistance: radiusMeters,
            spherical: true,
            query: { isOnline: true }
          }
        },
        {
          $lookup: {
            from: 'workers',
            localField: 'workerId',
            foreignField: '_id',
            as: 'worker'
          }
        },
        { $unwind: '$worker' },
        {
          $lookup: {
            from: 'users',
            localField: 'worker.userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'profiles',
            localField: 'worker.userId',
            foreignField: 'userId',
            as: 'profile'
          }
        },
        { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } }
      ]);
    } catch (aggErr) {
      if (aggErr.code === 27 || aggErr.message?.includes('$geoNear')) {
        await WorkerLocation.createIndexes();
        const allOnlineLocations = await WorkerLocation.find({ isOnline: true })
          .populate({
            path: 'workerId',
            populate: [{ path: 'userId' }]
          });

        const radiusKm = radiusMeters / 1000;
        const matched = [];

        for (const loc of allOnlineLocations) {
          if (!loc.workerId || !loc.location?.coordinates) continue;
          const [wLon, wLat] = loc.location.coordinates;
          const distKm = calculateDistanceKm(customerCoords[0], customerCoords[1], wLon, wLat);
          if (distKm <= radiusKm) {
            matched.push({
              worker: loc.workerId,
              workerUser: loc.workerId.userId,
              workerProfile: null,
              workerLocation: loc.location.coordinates,
              distanceMeters: distKm * 1000,
              distanceKm: distKm
            });
          }
        }
        return matched.sort((a, b) => a.distanceMeters - b.distanceMeters);
      }
      throw aggErr;
    }

    return results.map(item => ({
      worker: item.worker,
      workerUser: item.user,
      workerProfile: item.profile,
      workerLocation: item.location.coordinates,
      distanceMeters: item.distanceMeters,
      distanceKm: Math.round((item.distanceMeters / 1000) * 100) / 100
    }));
  } catch (err) {
    console.error(`[GeoSearch] Error running geo query:`, err);
    return [];
  }
}
