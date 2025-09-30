import express from 'express';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBannersAdmin,
} from '../controllers/bannerController.js';
import { protect, admin, adminOrHigher } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBanners).post(protect, adminOrHigher, createBanner);
router.route('/admin').get(protect, adminOrHigher, getAllBannersAdmin);
router
  .route('/:id')
  .get(getBannerById)
  .put(protect, adminOrHigher, updateBanner)
  .delete(protect, adminOrHigher, deleteBanner);

export default router;
