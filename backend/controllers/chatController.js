import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeTestReport } from '../config/geminiConfig.js';

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
const createChat = asyncHandler(async (req, res) => {
  const newChat = new Chat({
    user: req.user._id,
    messages: [],
  });

  const createdChat = await newChat.save();
  res.status(201).json(createdChat);
});

// @desc    Get user chats
// @route   GET /api/chats
// @access  Private
const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(chats);
});

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (chat && chat.user.toString() === req.user._id.toString()) {
    res.json(chat);
  } else {
    res.status(404);
    throw new Error('Chat not found or not authorized');
  }
});

// Fix the addMessageToChat function
const addMessageToChat = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const sender = req.body.sender || 'user'; // Default to 'user' if not specified

  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    if (chat.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    const newMessage = {
      content,
      sender,
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Generate AI response only if user sent a message and it's not part of an automated process
    if (sender === 'user' && !req.body.skipAiResponse) {
      const aiResponse = {
        content:
          'I have received your message. How can I help you with your test report?',
        sender: 'ai',
      };

      chat.messages.push(aiResponse);
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).send(`Error adding message: ${error.message}`);
  }
});

// @desc    Analyze test report image
// @route   POST /api/chats/analyze
// @access  Private
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }

  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagePath = req.file.path;

    console.log(
      `Processing image: ${req.file.originalname}, path: ${imagePath}`
    );

    // Call Gemini 2.5 API to analyze the image
    const result = await analyzeTestReport(imagePath, req.file.mimetype);

    if (result.success) {
      res.json({
        success: true,
        message: 'Image analyzed successfully',
        analysis: result.analysis,
        imageUrl: `/uploads/test-report-images/${path.basename(req.file.path)}`,
      });
    } else {
      res.status(500);
      throw new Error(result.error || 'Failed to analyze image');
    }
  } catch (error) {
    console.error('Error in analyzeImage controller:', error);
    res.status(500);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
});

export {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  analyzeImage,
};
