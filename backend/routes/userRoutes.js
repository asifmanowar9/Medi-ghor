import express from 'express';
const router = express.Router();
import {
  authUser,
  getUserProfile,
  registerUser,
  updadteUserProfile,
  getUser,
  deleteUser,
  updateUser,
  getUserById,
} from '../controllers/userController.js';
import {
  firebaseLogin,
  firebaseRegister,
  googleLogin,
} from '../controllers/firebaseAuthController.js';
import {
  protect,
  admin,
  adminOrHigher,
  superAdmin,
} from '../middleWare/authMiddleware.js';

router.route('/').post(registerUser).get(protect, adminOrHigher, getUser); // Route to handle user registration
router.post('/login', authUser); // Route to handle user login

// Firebase authentication routes
router.post('/firebase-login', firebaseLogin); // Firebase email/password login
router.post('/firebase-register', firebaseRegister); // Firebase email/password registration
router.post('/google-login', googleLogin); // Google Sign-In
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updadteUserProfile); // Route to get user profile
router
  .route('/:id')
  .delete(protect, adminOrHigher, deleteUser)
  .get(protect, adminOrHigher, getUserById)
  .put(protect, adminOrHigher, updateUser); // Route to delete a user by ID

export default router;
