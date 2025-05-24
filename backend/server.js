import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors'; // Import the CORS package
import { notFound, errorHandler } from './middleWare/errorMiddleware.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import fs from 'fs';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

connectDB();

const app = express();

// Configure CORS with specific options
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Logging middleware for development
}

app.use(express.json()); // for parsing application/json

// Basic route to test API connection
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test route for CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// Set up API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chats', chatRoutes);

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

app.get('/api/config/stripe', (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

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

const PORT = process.env.PORT || 5000;

// Add code to create the directory on server startup if it doesn't exist:
const testReportDir = path.join(__dirname, '../uploads/test-report-images');
if (!fs.existsSync(testReportDir)) {
  fs.mkdirSync(testReportDir, { recursive: true });
  console.log(`Created directory: ${testReportDir}`);
}

// Simple scheduler to avoid rate limits by spacing out requests
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

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
