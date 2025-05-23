import express from 'express';
import {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  analyzeImage,
} from '../controllers/chatController.js';
import { protect } from '../middleWare/authMiddleware.js';
import { upload } from '../middleWare/uploadMiddleware.js';
import { uploadTestReport } from '../middleWare/testReportUploadMiddleware.js';

const router = express.Router();

// Test route to verify API functionality
router.get('/test', (req, res) => {
  res.json({ message: 'Chat API is working properly!' });
});

// Chat routes
router.route('/').post(protect, createChat).get(protect, getUserChats);
router.route('/:id').get(protect, getChatById);
router.route('/:id/messages').post(protect, addMessageToChat);
router
  .route('/analyze')
  .post(protect, uploadTestReport.single('image'), analyzeImage);

export default router;
