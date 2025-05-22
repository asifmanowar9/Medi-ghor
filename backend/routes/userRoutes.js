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
import { protect, admin } from '../middleWare/authMiddleware.js';

router.route('/').post(registerUser).get(protect, admin, getUser); // Route to handle user registration
router.post('/login', authUser); // Route to handle user login
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updadteUserProfile); // Route to get user profile
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser); // Route to delete a user by ID

export default router;
