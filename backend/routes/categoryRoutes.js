import express from 'express';
import {
  getCategories,
  getFeaturedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOrHigher } from '../middleWare/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, adminOrHigher, createCategory);
router.route('/featured').get(getFeaturedCategories);
router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, adminOrHigher, updateCategory)
  .delete(protect, adminOrHigher, deleteCategory);

export default router;
