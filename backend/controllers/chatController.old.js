import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import path from 'path';
import { analyzeTestReport } from '../config/geminiConfig.js';
import { analyzeTestReportWithOCR } from '../config/ocrSpaceConfig.js';
import { generateMedicalResponse } from '../config/medicalChatConfig.js';

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

// Modify the addMessageToChat validation

const addMessageToChat = asyncHandler(async (req, res) => {
  try {
    const chatId = req.params.id;
    const { content, skipAiResponse, isAnalysis } = req.body;
    const sender = 'user';

    // Modified validation to allow empty strings or spaces
    if (content === undefined) {
      res.status(400);
      throw new Error('Message content is required');
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    // Add user message with proper content (even if empty)
    const userMessage = {
      content: content || '', // Accept empty content for image messages
      sender,
      isAnalysis: false,
    };

    chat.messages.push(userMessage);
    await chat.save();

    // Generate AI response if needed
    if (sender === 'user' && !skipAiResponse) {
      try {
        // Use our medical chat response generator
        const aiResponseContent = await generateMedicalResponse(
          content || '',
          chat.messages
        );

        const aiResponse = {
          content: aiResponseContent,
          sender: 'ai',
          isAnalysis: isAnalysis || false, // Add isAnalysis flag from request
        };

        chat.messages.push(aiResponse);
        await chat.save();
      } catch (aiError) {
        console.error('Error generating AI response:', aiError);

        // Create a more informative fallback response
        let fallbackMessage =
          "I apologize, but I'm currently experiencing technical difficulties. ";

        // If it's a 404 error (model not found)
        if (aiError.status === 404) {
          fallbackMessage += 'The AI model is currently unavailable. ';
        }
        // If it's a rate limit error
        else if (aiError.status === 429) {
          fallbackMessage += "I'm receiving too many requests right now. ";
        }

        fallbackMessage +=
          'Please try uploading a medical test report for analysis using the clip button, which uses a different processing method.';

        const fallbackResponse = {
          content: fallbackMessage,
          sender: 'ai',
        };

        chat.messages.push(fallbackResponse);
        await chat.save();
      }
    }

    res.json(chat);
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).send(`Error adding message: ${error.message}`);
  }
});

// Update the analyzeImage function to properly handle uploaded files

const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const chatId = req.query.chatId;
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required',
      });
    }

    console.log(
      `Processing image: ${req.file.originalname}, path: ${req.file.path}`
    );

    // Create image URL path for storage in the database
    const imageUrl = `/uploads/test-report-images/${req.file.filename}`;
    const imagePath = req.file.path;

    // Update the chat with the image URL
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Store the image URL in the chat
    const userMessage = {
      sender: 'user',
      content: ' ', // Empty content for image-only message
      imageUrl: imageUrl,
    };

    chat.messages.push(userMessage);
    await chat.save();
    console.log(`Updated message with image URL: ${imageUrl}`);

    // First try with OCR.Space
    try {
      console.log('Using OCR.Space for image analysis...');
      const result = await analyzeTestReportWithOCR(imagePath);

      return res.json({
        success: true,
        message: 'Image analyzed successfully with OCR.Space',
        analysis: result.analysis,
        imageUrl: imageUrl,
        model: 'ocr-space',
        confidence: result.confidence || 85,
      });
    } catch (ocrError) {
      console.error('OCR.Space API error:', ocrError);

      // Fall back to Gemini API
      try {
        console.log('Falling back to Gemini API...');
        const result = await analyzeTestReport(imagePath, req.file.mimetype);

        return res.json({
          success: true,
          message: 'Image analyzed successfully with Gemini API',
          analysis: result.analysis,
          imageUrl: imageUrl,
          model: result.model || 'gemini',
        });
      } catch (geminiError) {
        console.error('Gemini API analysis failed:', geminiError);

        // Generate a simple fallback analysis
        const { getImageStats, generateFallbackAnalysis } = await import(
          '../utils/fallbackAnalysis.js'
        );
        const imageStats = await getImageStats(imagePath);
        const fallbackAnalysis = generateFallbackAnalysis(
          imageStats,
          req.file.originalname
        );

        return res.json({
          success: true,
          message: 'Using fallback analysis due to service unavailability',
          analysis: fallbackAnalysis,
          imageUrl: imageUrl,
          model: 'fallback',
          confidence: 40,
        });
      }
    }
  } catch (error) {
    console.error('Error in analyzeImage:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing image',
      error: error.message,
    });
  }
};

export {
  createChat,
  getUserChats,
  getChatById,
  addMessageToChat,
  analyzeImage,
};
