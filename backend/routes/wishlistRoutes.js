import express from 'express';
const router = express.Router();
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  clearWishlist,
  checkRestockedProducts,
  syncWishlist,
} from '../controllers/wishlistController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

router
  .route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/sync').post(protect, syncWishlist);
router.route('/check-restock').post(protect, admin, checkRestockedProducts);
router.route('/:id').delete(protect, removeFromWishlist);

export default router;
