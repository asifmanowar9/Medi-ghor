import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
} from '../controllers/productController.js';

router.route('/').get(getProducts); // Route to get all products
router.route('/:id').get(getProductById); // Route to get a single product by ID

export default router;
