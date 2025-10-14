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
  const { title, description, metadata } = req.body;

  const chatData = {
    user: req.user._id,
    title: title || 'AI Medical Chat',
    category: 'ai_chat', // Default category for simplified AI chat
    description: description || '',
    metadata: metadata || {},
    messages: [],
  };

  const newChat = new Chat(chatData);
  const createdChat = await newChat.save();

  // Populate user data
  await createdChat.populate('user', 'name email');

  res.status(201).json(createdChat);
});

// @desc    Get user chats with filtering and pagination
// @route   GET /api/chats
// @access  Private
const getUserChats = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = 'active',
    category,
    search,
    sortBy = 'lastActivity',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNum - 1) * pageSize;

  // Build filter query
  const filter = { user: req.user._id };

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Build sort query
  const sortQuery = {};
  sortQuery[sortBy] = sortOrder === 'desc' ? -1 : 1;

  try {
    const chats = await Chat.find(filter)
      .populate('user', 'name email')
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .select('-messages'); // Exclude messages for list view

    const total = await Chat.countDocuments(filter);

    // Get chat statistics
    const stats = await Chat.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          activeChats: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          completedChats: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalMessages: { $sum: '$messageCount' },
          totalAnalyses: { $sum: '$analysisCount' },
        },
      },
    ]);

    res.json({
      chats,
      currentPage: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalChats: total,
      hasNextPage: pageNum < Math.ceil(total / pageSize),
      hasPrevPage: pageNum > 1,
      stats: stats[0] || {
        totalChats: 0,
        activeChats: 0,
        completedChats: 0,
        totalMessages: 0,
        totalAnalyses: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// @desc    Get chat by ID with full message history
// @route   GET /api/chats/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Check if user owns the chat or has shared access
  const hasAccess =
    chat.user._id.toString() === req.user._id.toString() ||
    chat.privacy.sharedWith.some(
      (share) => share.userId.toString() === req.user._id.toString()
    );

  if (!hasAccess) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json(chat);
});

// @desc    Update chat details
// @route   PUT /api/chats/:id
// @access  Private
const updateChat = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (chat.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  // Update fields
  if (title !== undefined) chat.title = title;
  if (description !== undefined) chat.description = description;

  const updatedChat = await chat.save();
  await updatedChat.populate('user', 'name email');

  res.json(updatedChat);
});

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (chat.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  await Chat.findByIdAndDelete(req.params.id);
  res.json({ message: 'Chat deleted successfully' });
});

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
const addMessageToChat = asyncHandler(async (req, res) => {
  const {
    content,
    messageType = 'text',
    skipAiResponse = false,
    isAnalysis = false,
  } = req.body;
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (chat.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  const sender = 'user';

  // Add user message
  const userMessage = {
    content: content || '',
    sender,
    messageType,
    isAnalysis: false,
  };

  chat.messages.push(userMessage);
  await chat.save();

  // Generate AI response if needed
  if (sender === 'user' && !skipAiResponse && content.trim()) {
    try {
      const aiResponseContent = await generateMedicalResponse(
        content,
        chat.messages.slice(-10) // Last 10 messages for context
      );

      const aiResponse = {
        content: aiResponseContent,
        sender: 'ai',
        messageType: 'text',
        isAnalysis: isAnalysis || false,
      };

      chat.messages.push(aiResponse);
      await chat.save();
    } catch (aiError) {
      console.error('Error generating AI response:', aiError);

      let fallbackMessage =
        "I apologize, but I'm currently experiencing technical difficulties. ";

      if (aiError.status === 404) {
        fallbackMessage += 'The AI model is currently unavailable. ';
      } else if (aiError.status === 429) {
        fallbackMessage += "I'm receiving too many requests right now. ";
      }

      fallbackMessage +=
        'Please try uploading a medical test report for analysis using the attachment button, which uses a different processing method.';

      const fallbackResponse = {
        content: fallbackMessage,
        sender: 'ai',
        messageType: 'text',
      };

      chat.messages.push(fallbackResponse);
      await chat.save();
    }
  }

  // Populate and return updated chat
  await chat.populate('user', 'name email');
  res.json(chat);
});

// @desc    Analyze uploaded image
// @route   POST /api/chats/analyze
// @access  Private
const analyzeImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image uploaded');
  }

  const { chatId } = req.query;

  if (!chatId) {
    res.status(400);
    throw new Error('Chat ID is required');
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  if (chat.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }

  try {
    const imagePath = req.file.path;
    const imageType = req.file.mimetype;
    const imageUrl = `/uploads/test-report-images/${req.file.filename}`;

    console.log('Analyzing image:', {
      path: imagePath,
      type: imageType,
      url: imageUrl,
    });

    // Add image message to chat first
    const imageMessage = {
      content: '',
      sender: 'user',
      messageType: 'image',
      imageUrl: imageUrl,
      imageMetadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        analysisStatus: 'processing',
      },
    };

    chat.messages.push(imageMessage);
    await chat.save();

    let analysisResult;
    let model = 'gemini-pro-vision';

    try {
      // Try Gemini first
      analysisResult = await analyzeTestReport(imagePath, imageType);
      console.log('Gemini analysis successful');
    } catch (geminiError) {
      console.log('Gemini failed, trying OCR.Space:', geminiError.message);

      try {
        analysisResult = await analyzeTestReportWithOCR(imagePath);
        model = 'ocr-space';
        console.log('OCR.Space analysis successful');
      } catch (ocrError) {
        console.error('Both analysis methods failed:', ocrError);
        throw new Error('Image analysis failed with all available methods');
      }
    }

    // Update image message status
    const imageMessageIndex = chat.messages.length - 1;
    chat.messages[imageMessageIndex].imageMetadata.analysisStatus = 'completed';

    // Add analysis result as AI message
    const analysisMessage = {
      content: analysisResult.analysis || analysisResult,
      sender: 'ai',
      messageType: 'analysis',
      isAnalysis: true,
      analysisData: {
        model: model,
        confidence: analysisResult.confidence || null,
        ocrText: analysisResult.ocrText || null,
        findings: analysisResult.findings || [],
        recommendations: analysisResult.recommendations || [],
      },
    };

    chat.messages.push(analysisMessage);
    await chat.save();

    await chat.populate('user', 'name email');

    res.json({
      success: true,
      analysis: analysisResult.analysis || analysisResult,
      model: model,
      confidence: analysisResult.confidence,
      imageUrl: imageUrl,
      chat: chat,
    });
  } catch (error) {
    console.error('Error analyzing image:', error);

    // Update image message status to failed if it exists
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.messageType === 'image') {
        lastMessage.imageMetadata.analysisStatus = 'failed';
        await chat.save();
      }
    }

    res.status(500);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
});

// @desc    Get chat categories with counts
// @route   GET /api/chats/categories
// @access  Private
const getChatCategories = asyncHandler(async (req, res) => {
  const categories = await Chat.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        lastActivity: { $max: '$lastActivity' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json(categories);
});

export {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
  addMessageToChat,
  analyzeImage,
  getChatCategories,
};
