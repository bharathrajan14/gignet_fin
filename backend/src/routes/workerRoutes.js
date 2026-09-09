import express from 'express';
import {
  getProfile,
  toggleOnline,
  updateLocation,
  getPendingOffers,
  respondToOffer,
  getActiveJob,
  advanceJobStatus,
  getEarnings,
  uploadKyc,
  completeJobWithParts
} from '../controllers/workerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/status/online', toggleOnline);
router.post('/location', updateLocation);
router.get('/offers/pending', getPendingOffers);
router.post('/offers/:offerId/respond', respondToOffer);
router.get('/jobs/current', getActiveJob);
router.put('/jobs/:id/status', advanceJobStatus);
router.post('/jobs/:id/complete-with-parts', completeJobWithParts);
router.get('/earnings', getEarnings);
router.post('/kyc', uploadKyc);

export default router;
