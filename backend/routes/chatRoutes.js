import express from 'express';
import {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
  addMessageToChat,
  analyzeImage,
  getChatCategories,
} from '../controllers/chatController.js';
import { protect } from '../middleWare/authMiddleware.js';
import {
  uploadTestReport,
  compressImage,
} from '../middleWare/testReportUploadMiddleware.js';

const router = express.Router();

// // Test route to verify API functionality
// router.get('/test', (req, res) => {
//   res.json({ message: 'Chat API is working properly!' });
// });

// Chat CRUD routes
router.route('/').post(protect, createChat).get(protect, getUserChats);
router.route('/categories').get(protect, getChatCategories);
router
  .route('/:id')
  .get(protect, getChatById)
  .put(protect, updateChat)
  .delete(protect, deleteChat);

// Message routes
router.route('/:id/messages').post(protect, addMessageToChat);

// Image analysis route with compression middleware
router.post(
  '/analyze',
  protect,
  uploadTestReport.single('image'),
  compressImage,
  analyzeImage
);

export default router;
