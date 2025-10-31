import express from 'express';
import {
  createCheckoutSession,
  verifyPaymentAndEnroll,
  handleStripeWebhook,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { verifyToken, verifyStudent } from '../middleware/auth.js';

const router = express.Router();

// Webhook route - Stripe needs raw body, not JSON parsed
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Student payment routes (require authentication)
router.post('/checkout/:courseId', verifyToken, verifyStudent, createCheckoutSession);
router.get('/verify', verifyPaymentAndEnroll);
router.get('/history', verifyToken, verifyStudent, getPaymentHistory);

export default router;

