import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
  getFlashSaleProducts,
  getBestSellerProducts,
  getProductsByCategory,
} from '../controllers/productController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

// Recommended route order:
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/top').get(getTopProducts); // Route to get top rated products - this should come before /:id
router.route('/featured').get(getFeaturedProducts); // Route to get featured products
router.route('/flash-sale').get(getFlashSaleProducts); // Route to get flash sale products
router.route('/best-sellers').get(getBestSellerProducts); // Route to get best seller products
router.route('/category/:categoryId').get(getProductsByCategory); // Route to get products by category
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);
router.route('/:id/reviews').post(protect, createProductReview); // Route to create a product review

export default router;
