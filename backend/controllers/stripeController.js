import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/orderModel.js';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    'sk_test_51RQYZlP11Sk4nHrMwIkGG1lj2bN0IVgo8cnW0ujUc95FVvC6SWkV59WBsCgBgd0SEARQD863EpojIP3dFVCYDlSz00O3SUDVdp'
);

// @desc    Create a Stripe payment intent
// @route   POST /api/config/stripe
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  // Find the order to get the amount
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Create a payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      orderId: orderId.toString(),
      integration_check: 'accept_a_payment',
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

export { createPaymentIntent };
