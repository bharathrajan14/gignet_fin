import express from 'express';
import {
  getServices,
  classifyProblem,
  createBooking,
  getBookingDetails,
  getActiveBooking,
  getBookingHistory,
  processDemoPayment,
  submitRating
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/services', getServices);
router.post('/classify-problem', classifyProblem);

// Authenticated routes
router.use(authenticate);
router.post('/bookings', createBooking);
router.get('/bookings/active', getActiveBooking);
router.get('/bookings/history', getBookingHistory);
router.get('/bookings/:id', getBookingDetails);
router.post('/payments/demo-pay', processDemoPayment);
router.post('/ratings', submitRating);

export default router;
