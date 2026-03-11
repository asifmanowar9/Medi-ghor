// Import the express route fix before any other imports
import './utils/expressRouteFix.js';

// Run the direct fix first, before any imports
import './utils/fixPathToRegexp.js';

// Then continue with your existing imports
import './utils/expressPatch.js';
import './utils/pathPatch.js';

// Regular imports follow
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import { notFound, errorHandler } from './middleWare/errorMiddleWare.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import fs from 'fs';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import healthConditionRoutes from './routes/healthConditionRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';

// Load environment variables from root .env file FIRST
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env'),
});

// Initialize Firebase Admin SDK
import './config/firebaseAdmin.js';

connectDB();

const app = express();

// Configure CORS with specific options
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging middleware for development
}

app.use(express.json()); // for parsing application/json

// Set up API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/health-conditions', healthConditionRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(
  '/images',
  express.static(path.join(__dirname, '../frontend/public/images'))
);
app.use(
  '/uploads/test-report-images',
  express.static(path.join(__dirname, '../uploads/test-report-images'))
);
app.use(
  '/uploads/prescriptions',
  express.static(path.join(__dirname, '../uploads/prescriptions'))
);

app.get('/api/config/stripe', (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// API status route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Rate limiting middleware
let lastRequestTime = 0;
const minRequestInterval = 5000; // 5 seconds between each API call

app.use('/api/chats/analyze', (req, res, next) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < minRequestInterval) {
    const waitTime = minRequestInterval - timeSinceLastRequest;
    console.log(
      `Rate limiting: Waiting ${waitTime}ms before processing next request`
    );

    setTimeout(() => {
      lastRequestTime = Date.now();
      next();
    }, waitTime);
  } else {
    lastRequestTime = now;
    next();
  }
});

// Create necessary directories
const testReportDir = path.join(__dirname, '../uploads/test-report-images');
if (!fs.existsSync(testReportDir)) {
  fs.mkdirSync(testReportDir, { recursive: true });
  console.log(`Created directory: ${testReportDir}`);
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Set max listeners to avoid EventEmitter warning
process.setMaxListeners(20);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
