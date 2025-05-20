import express from 'express';
const router = express.Router();
import {
  authUser,
  getUserProfile,
  registerUser,
  updadteUserProfile,
  getUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

router.route('/').post(registerUser).get(protect, admin, getUser); // Route to handle user registration
router.post('/login', authUser); // Route to handle user login
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updadteUserProfile); // Route to get user profile

export default router;
