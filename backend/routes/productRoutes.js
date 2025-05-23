import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts); // Route to get all products
router.route('/:id').get(getProductById); // Route to get a single product by ID
router.route('/:id').delete(protect, admin, deleteProduct); // Route to delete a product by ID
router.route('/').post(protect, admin, createProduct); // Route to create a product
router.route('/:id').put(protect, admin, updateProduct); // Route to update a product by ID

export default router;
