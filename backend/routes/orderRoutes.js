import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  trackOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin, adminOrHigher } from '../middleWare/authMiddleware.js';

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/track/:id').get(trackOrderById); // Public track order endpoint
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, adminOrHigher, updateOrderStatus);
router.route('/').get(protect, admin, getOrders);
router
  .route('/:id/deliver')
  .put(protect, adminOrHigher, updateOrderToDelivered);

export default router;
