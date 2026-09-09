import express from 'express';
import { requestDemoOtp, verifyDemoOtp, switchDemoPersona, getMe, getWorkerPersonas } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/demo-otp/request', requestDemoOtp);
router.post('/demo-otp/verify', verifyDemoOtp);
router.post('/demo-switch', switchDemoPersona);
router.get('/worker-personas', getWorkerPersonas);
router.get('/me', authenticate, getMe);

export default router;
