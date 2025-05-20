import express from 'express';
import { createPaymentIntent } from '../controllers/stripeController.js';
import { protect } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.route('/create-payment-intent').post(protect, createPaymentIntent);

export default router;
