import * as h3 from 'h3-js';
import { H3_RESOLUTIONS } from '../shared/contracts.js';

/**
 * Calculates Haversine distance in kilometers between two [lon, lat] points
 */
export function calculateDistanceKm(lon1, lat1, lon2, lat2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
}

/**
 * Estimates urban motorcycle/scooter travel time in minutes (assumes avg 25 km/h + 3 min prep)
 */
export function estimateTravelMinutes(distanceKm) {
  const avgSpeedKmPerHour = 25;
  const travelMinutes = (distanceKm / avgSpeedKmPerHour) * 60;
  return Math.max(3, Math.round(travelMinutes + 3));
}

/**
 * Encodes coordinates to H3 hex cell IDs
 */
export function toH3(lat, lon, res = H3_RESOLUTIONS.COOPERATIVE_BOUNDARY) {
  try {
    return h3.latLngToCell(lat, lon, res);
  } catch (err) {
    return '';
  }
}

/**
 * Gets polygon boundary coordinates for an H3 cell for MapLibre/Leaflet rendering
 */
export function getH3Boundary(cellId) {
  try {
    // Returns array of [lat, lng]
    return h3.cellToBoundary(cellId);
  } catch (err) {
    return [];
  }
}
