import express from 'express';
import { protect } from '../middleWare/authMiddleware.js';
import {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  analyzeImage,
} from '../controllers/chatController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createChat).get(protect, getUserChats);

router.route('/:id').get(protect, getChatById);

router.route('/:id/messages').post(protect, addMessageToChat);

router.route('/analyze').post(protect, upload.single('image'), analyzeImage);

export default router;
