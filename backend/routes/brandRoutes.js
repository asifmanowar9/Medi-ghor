import express from 'express';
import {
  getBrands,
  getFeaturedBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBrands).post(protect, admin, createBrand);
router.route('/featured').get(getFeaturedBrands);
router
  .route('/:id')
  .get(getBrandById)
  .put(protect, admin, updateBrand)
  .delete(protect, admin, deleteBrand);

export default router;
