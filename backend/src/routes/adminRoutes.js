import express from 'express';
import {
  getCooperatives,
  getWorkers,
  reviewKyc,
  getLiveBookings,
  getAllocationTrail,
  getFairnessMetrics,
  getMapClusters,
  getForecasts,
  triggerForecastRecalculation,
  getSharingRequests,
  createSharingRequest,
  getFinancialReconciliation
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Allow public/authenticated read for demo flexibility, or require ADMIN/COOP_ADMIN
router.use(authenticate);
router.use(requireRole(['COOPERATIVE_ADMIN', 'FEDERATION_ADMIN', 'SYSTEM_ADMIN', 'CUSTOMER', 'WORKER'])); // flexible for demo persona switching

router.get('/cooperatives', getCooperatives);
router.get('/workers', getWorkers);
router.put('/workers/:id/kyc-verify', reviewKyc);
router.get('/bookings/live', getLiveBookings);
router.get('/bookings/:id/allocation-trail', getAllocationTrail);
router.get('/workforce/fairness', getFairnessMetrics);
router.get('/workforce/map-clusters', getMapClusters);
router.get('/forecasts', getForecasts);
router.post('/forecasts/recalculate', triggerForecastRecalculation);
router.get('/worker-sharing', getSharingRequests);
router.post('/worker-sharing', createSharingRequest);
router.get('/finance/reconciliation', getFinancialReconciliation);

export default router;
