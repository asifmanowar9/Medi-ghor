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
} from '../controllers/productController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

// Recommended route order:
router.route('/').get(getProducts); // Route to get all products
router.route('/').post(protect, admin, createProduct); // Route to create a product
router.route('/top').get(getTopProducts); // Route to get top rated products - this should come before /:id
router.route('/:id').get(getProductById); // Route to get a single product by ID
router.route('/:id').delete(protect, admin, deleteProduct); // Route to delete a product by ID
router.route('/:id').put(protect, admin, updateProduct); // Route to update a product by ID
router.route('/:id/reviews').post(protect, createProductReview); // Route to create a product review

export default router;
