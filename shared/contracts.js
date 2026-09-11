/**
 * GIGNET Cooperative Workforce & Service Network
 * Shared Domain Enums & Architectural Contracts
 */

export const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  WORKER: 'WORKER',
  COOPERATIVE_ADMIN: 'COOPERATIVE_ADMIN',
  FEDERATION_ADMIN: 'FEDERATION_ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
});

export const BOOKING_TYPES = Object.freeze({
  EMERGENCY: 'EMERGENCY',
  SCHEDULED: 'SCHEDULED'
});

export const BOOKING_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  SEARCHING: 'SEARCHING',
  OFFERED: 'OFFERED',
  CONFIRMED: 'CONFIRMED',
  ON_THE_WAY: 'ON_THE_WAY',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
});

export const OFFER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  TIMED_OUT: 'TIMED_OUT',
  REVOKED: 'REVOKED'
});

export const WORKLOAD_STATUSES = Object.freeze({
  UNDERUTILIZED: 'UNDERUTILIZED',
  BALANCED: 'BALANCED',
  HIGH_WORKLOAD: 'HIGH_WORKLOAD',
  OVERLOADED: 'OVERLOADED'
});

export const KYC_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
});

export const SERVICE_CATEGORIES = Object.freeze({
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  CARPENTRY: 'CARPENTRY',
  APPLIANCE: 'APPLIANCE',
  CLEANING: 'CLEANING',
  MASONRY: 'MASONRY'
});

export const ALLOCATION_STAGES = Object.freeze({
  RADIUS_2KM: 'RADIUS_2KM',
  RADIUS_5KM: 'RADIUS_5KM',
  RADIUS_10KM: 'RADIUS_10KM',
  RADIUS_15KM: 'RADIUS_15KM',
  NEIGHBOR_COOPERATIVE: 'NEIGHBOR_COOPERATIVE',
  FEDERATION_POOL: 'FEDERATION_POOL'
});

export const PAYMENT_METHODS = Object.freeze({
  DEMO_UPI: 'DEMO_UPI',
  DEMO_CARD: 'DEMO_CARD',
  CASH_ON_SERVICE: 'CASH_ON_SERVICE'
});

export const FINANCIAL_SPLIT = Object.freeze({
  WORKER_SHARE_PERCENT: 0.80,       // 80% direct to worker
  COOPERATIVE_RESERVE_PERCENT: 0.15, // 15% cooperative welfare & emergency fund
  PLATFORM_INFRA_PERCENT: 0.05       // 5% tech maintenance & infrastructure
});

export const SEARCH_RADII = Object.freeze({
  SCHEDULED: [2, 5, 10, 15], // in km
  EMERGENCY: [3, 6, 12, 15]  // in km: starts wider and expands faster
});

export const ALLOCATION_WEIGHTS = Object.freeze({
  SCHEDULED: {
    UTILIZATION: 0.60,
    RATING: 0.20,
    DISTANCE: 0.20,
    SAME_COOP_BONUS: 0.08
  },
  EMERGENCY: {
    DISTANCE: 0.70,
    RATING: 0.20,
    UTILIZATION: 0.10,
    SAME_COOP_BONUS: 0.00
  },
  SAFETY_BUFFER_MIN: 10 // Minutes of required slack for emergency vs scheduled conflict
});

export const OFFER_COUNTDOWN_SECONDS = 45;

export const H3_RESOLUTIONS = Object.freeze({
  COOPERATIVE_BOUNDARY: 7, // ~1.22 km edge length hex
  MICRO_CLUSTER: 8         // ~461 m edge length hex
});

// Centralized Multilingual Service Catalog Internationalization
export * from './src/i18n/catalogI18n.js';

