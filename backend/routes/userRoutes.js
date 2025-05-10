import express from 'express';
const router = express.Router();
import { authUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleWare/authMiddleware.js';

router.post('/login', authUser); // Route to handle user login
router.get('/profile', protect, getUserProfile); // Route to get user profile

export default router;
