import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
const addMessageToChat = asyncHandler(async (req, res) => {
  const { content, sender } = req.body;

  const chat = await Chat.findById(req.params.id);

  if (chat && chat.user.toString() === req.user._id.toString()) {
    const newMessage = {
      content,
      sender,
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Generate AI response
    if (sender === 'user') {
      const aiResponse = {
        content:
          'I have received your message. How can I help you with your test report?',
        sender: 'ai',
      };

      chat.messages.push(aiResponse);
      await chat.save();
    }

    res.json(chat);
  } else {
    res.status(404);
    throw new Error('Chat not found or not authorized');
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

  // In a real implementation, you would send the image to an AI service
  // Here we'll simulate an AI response

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const imagePath = path.join(__dirname, '../../uploads', req.file.filename);

  // Simulate AI analyzing the image
  // In a real implementation, call an AI API here (e.g., Google Cloud Vision, Azure AI, etc.)
  const simulatedAnalysis = {
    reportType: 'Blood Test',
    findings: [
      { name: 'Hemoglobin', value: '14.2 g/dL', status: 'Normal' },
      { name: 'White Blood Cells', value: '7,500 /μL', status: 'Normal' },
      { name: 'Platelets', value: '250,000 /μL', status: 'Normal' },
      { name: 'Cholesterol', value: '190 mg/dL', status: 'Normal' },
    ],
    summary:
      'All values appear to be within normal ranges. This blood test suggests normal health indicators with no abnormal values detected.',
  };

  // Create a formatted response
  const analysisText = `
## Test Report Analysis

**Report Type**: ${simulatedAnalysis.reportType}

### Key Findings:
${simulatedAnalysis.findings
  .map((item) => `- **${item.name}**: ${item.value} (${item.status})`)
  .join('\n')}

### Summary:
${simulatedAnalysis.summary}

*Note: This is an AI-generated analysis and should not replace professional medical advice. Please consult with your healthcare provider for proper interpretation of these results.*
  `;

  res.json({
    success: true,
    message: 'Image analyzed successfully',
    analysis: analysisText,
    imageUrl: `/uploads/${req.file.filename}`,
  });
});

export {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  analyzeImage,
};
