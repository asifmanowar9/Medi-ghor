import express from 'express';
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBanners).post(protect, admin, createBanner);
router
  .route('/:id')
  .get(getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;
