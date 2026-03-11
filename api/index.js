// Vercel Serverless Function - API Entry Point
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from '../backend/config/db.js';

// Import routes
import productRoutes from '../backend/routes/productRoutes.js';
import userRoutes from '../backend/routes/userRoutes.js';
import orderRoutes from '../backend/routes/orderRoutes.js';
import stripeRoutes from '../backend/routes/stripeRoutes.js';
import chatRoutes from '../backend/routes/chatRoutes.js';
import bannerRoutes from '../backend/routes/bannerRoutes.js';
import categoryRoutes from '../backend/routes/categoryRoutes.js';
import brandRoutes from '../backend/routes/brandRoutes.js';
import healthConditionRoutes from '../backend/routes/healthConditionRoutes.js';
import wishlistRoutes from '../backend/routes/wishlistRoutes.js';
import prescriptionRoutes from '../backend/routes/prescriptionRoutes.js';

// Import middleware
import { notFound, errorHandler } from '../backend/middleWare/errorMiddleWare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: true, // Allow all origins in production, or specify your domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/health-conditions', healthConditionRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Stripe config endpoint
app.get('/api/config/stripe', (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export for Vercel
export default app;
