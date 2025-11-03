# Medi-ghor Project Architecture Documentation

## 📋 Table of Contents
1. [Database Architecture (MongoDB)](#1-database-architecture-mongodb)
2. [Frontend & Backend Communication](#2-frontend--backend-communication)
3. [Component Declaration Methods](#3-component-declaration-methods)
4. [React & Node.js Working Mechanism](#4-react--nodejs-working-mechanism)
5. [MongoDB Integration Methods](#5-mongodb-integration-methods)
6. [Project Structure Overview](#6-project-structure-overview)
7. [Key Features Implementation](#7-key-features-implementation)

---

## 1. Database Architecture (MongoDB)
### ডাটাবেস কি নিয়ে কাজ করছে?

### 🗄️ **Database Connection Setup**
```javascript
// File: backend/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

### 📊 **Database Models Structure**

#### **User Model** (ইউজার ডেটা)
```javascript
// File: backend/models/userModel.js
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }
}, { timestamps: true });
```

#### **Product Model** (ঔষধের তথ্য)
```javascript
// File: backend/models/productModel.js
const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },
  genericName: { type: String },
  dosageForm: { type: String },
  strength: { type: String },
  manufacturer: { type: String }
}, { timestamps: true });
```

#### **Order Model** (অর্ডার সিস্টেম)
```javascript
// File: backend/models/orderModel.js
const orderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  currentStatus: {
    type: String,
    enum: ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalPrice: { type: Number, required: true, default: 0.0 }
}, { timestamps: true });
```

### 💾 **Data Storage Strategy**
- **Collections**: Users, Products, Orders, Categories, Prescriptions, Chats
- **Relationships**: Using ObjectId references (User → Orders, Product → OrderItems)
- **Indexing**: Email unique index, Product search optimization
- **Validation**: Schema-level validation with Mongoose

---

## 2. Frontend & Backend Communication
### ফ্রন্টএন্ড, ব্যাকএন্ড কিভাবে কাজ করছে?

### 🔄 **Communication Flow Diagram**
```
Frontend (React) ←→ API Calls ←→ Backend (Node.js/Express) ←→ Database (MongoDB)
     ↓                           ↓                              ↓
 UI Components              Route Handlers                 Data Models
 State Management           Business Logic                Schema Validation
 User Interactions          Authentication                 CRUD Operations
```

### 🎯 **Backend API Structure**
```javascript
// File: backend/server.js
import express from 'express';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 🌐 **Frontend API Integration**
```javascript
// File: frontend/src/actions/productActions.js
import axios from 'axios';

// Product List Action
export const listProducts = (keyword = '', pageNumber = '') => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });
    
    const { data } = await axios.get(
      `/api/products?keyword=${keyword}&pageNumber=${pageNumber}`
    );
    
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

// Order Creation Action
export const createOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });

    const { userLogin: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/orders', order, config);
    
    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};
```

### 🔐 **Authentication Flow**
```javascript
// Backend: JWT Token Generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Frontend: Token Storage & Usage
localStorage.setItem('userInfo', JSON.stringify({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id),
}));
```

---

## 3. Component Declaration Methods
### কত ভাবে ক্লাস ডিক্লেয়ার করা যায়?

### 🆕 **Modern Functional Components** (প্রজেক্টে ব্যবহৃত)
```javascript
// File: frontend/src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ProfileScreen = () => {
  // State Hooks
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Redux Hooks
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.userDetails);

  // Effect Hook
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getUserDetails('profile'));
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo]);

  // Event Handlers
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ id: user._id, name, email }));
  };

  return (
    <div className='profile-screen-container'>
      <Container>
        {/* JSX Content */}
      </Container>
    </div>
  );
};

export default ProfileScreen;
```

### 🏗️ **Class Components** (পুরাতন পদ্ধতি)
```javascript
// Alternative: Class Component Approach
import React, { Component } from 'react';

class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      activeTab: 'profile'
    };
  }

  componentDidMount() {
    // Lifecycle method
    this.fetchUserData();
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  }

  render() {
    return (
      <div className='profile-screen-container'>
        {/* JSX Content */}
      </div>
    );
  }
}

export default ProfileScreen;
```

### 🎣 **Custom Hooks** (রিইউজেবল লজিক)
```javascript
// File: frontend/src/hooks/useCartAuth.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserCart } from '../actions/cartActions';

export const useCartAuth = () => {
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) {
      dispatch(loadUserCart());
    }
  }, [dispatch, userInfo]);

  return userInfo;
};
```

### 📦 **Higher-Order Components (HOC)**
```javascript
// Advanced: HOC for Authentication
const withAuth = (WrappedComponent) => {
  return (props) => {
    const userInfo = useSelector((state) => state.userLogin.userInfo);
    
    if (!userInfo) {
      return <Navigate to="/login" />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Usage
export default withAuth(ProfileScreen);
```

---

## 4. React & Node.js Working Mechanism
### React, Node.js কিভাবে কাজ করে?

### ⚛️ **React Frontend Architecture**

#### **Component Hierarchy**
```
App
├── Header
├── Router
│   ├── HomeScreen
│   ├── ProductScreen
│   ├── CartScreen
│   ├── ProfileScreen
│   └── OrderScreen
└── Footer
```

#### **State Management (Redux)**
```javascript
// File: frontend/src/store.js
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const reducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  cart: cartReducer,
  userLogin: userLoginReducer,
  userDetails: userDetailsReducer,
  orderListMy: orderListMyReducer,
  orderCreate: orderCreateReducer,
});

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(thunk))
);
```

#### **Component Lifecycle**
```javascript
// Functional Component Lifecycle
const ProductScreen = () => {
  // 1. Component Mount
  useEffect(() => {
    dispatch(listProductDetails(id));
  }, [dispatch, id]);

  // 2. State Updates
  const [qty, setQty] = useState(1);

  // 3. Event Handling
  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`);
  };

  // 4. Conditional Rendering
  return (
    <>
      {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
        <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name} fluid />
          </Col>
          <Col md={6}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};
```

### 🚀 **Node.js Backend Architecture**

#### **Server Structure**
```javascript
// File: backend/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Middleware Stack
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authMiddleware from './middleware/authMiddleware.js';

// Route Controllers
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);
```

#### **Controller Pattern**
```javascript
// File: backend/controllers/productController.js
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    description: 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

export { getProducts, createProduct };
```

#### **Middleware Implementation**
```javascript
// File: backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };
```

---

## 5. MongoDB Integration Methods
### অনেক ভাবেই মঙ্গো add করা যায় আপনি কি দিয়ে add করসেন?

### 🍃 **Mongoose ODM** (প্রজেক্টে ব্যবহৃত পদ্ধতি)

#### **Connection Setup**
```javascript
// File: backend/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
};

export default connectDB;
```

#### **Schema Definition & Validation**
```javascript
// File: backend/models/orderModel.js
import mongoose from 'mongoose';

const orderStatusSchema = mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
  },
  timestamp: { type: Date, required: true, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
});

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
  }],
  currentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [orderStatusSchema],
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
```

#### **CRUD Operations**
```javascript
// Create Operation
const createOrder = async (orderData) => {
  const order = new Order(orderData);
  return await order.save();
};

// Read Operations
const getAllOrders = async () => {
  return await Order.find({}).populate('user', 'name email');
};

const getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).populate('orderItems.product');
};

// Update Operation
const updateOrderStatus = async (orderId, status, notes) => {
  const order = await Order.findById(orderId);
  order.currentStatus = status;
  order.statusHistory.push({ status, notes, timestamp: new Date() });
  return await order.save();
};

// Delete Operation
const deleteOrder = async (orderId) => {
  return await Order.findByIdAndDelete(orderId);
};
```

### 🔄 **Alternative MongoDB Integration Methods**

#### **1. Native MongoDB Driver**
```javascript
// Alternative: Direct MongoDB Driver
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await client.connect();
    const db = client.db('medighor');
    
    // Raw operations
    const users = await db.collection('users').find({}).toArray();
    await db.collection('products').insertOne({ name: 'Medicine' });
  } catch (error) {
    console.error(error);
  }
};
```

#### **2. MongoDB Atlas Cloud**
```javascript
// Cloud Database Connection
const MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/medighor?retryWrites=true&w=majority";
```

#### **3. Prisma ORM** (Alternative)
```javascript
// Alternative: Prisma Schema
// File: prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  name     String
  email    String  @unique
  orders   Order[]
}

model Order {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  userId   String @db.ObjectId
  user     User   @relation(fields: [userId], references: [id])
  status   String
}
```

### 🏆 **আপনার প্রজেক্টে Mongoose ব্যবহারের সুবিধা:**

1. **Schema Validation**: Automatic data validation
2. **Middleware Support**: Pre/post hooks for operations
3. **Population**: Easy relationship handling
4. **Query Builder**: Intuitive query syntax
5. **Connection Management**: Automatic connection pooling

---

## 6. Project Structure Overview

### 📁 **Backend Structure**
```
backend/
├── config/
│   ├── db.js                 # Database connection
│   ├── emailConfig.js        # Email service setup
│   └── geminiConfig.js       # AI integration
├── controllers/
│   ├── userController.js     # User business logic
│   ├── productController.js  # Product operations
│   ├── orderController.js    # Order management
│   └── chatController.js     # AI chat functionality
├── middleware/
│   ├── authMiddleware.js     # Authentication
│   └── errorMiddleware.js    # Error handling
├── models/
│   ├── userModel.js          # User schema
│   ├── productModel.js       # Product schema
│   └── orderModel.js         # Order schema
├── routes/
│   ├── userRoutes.js         # User API endpoints
│   ├── productRoutes.js      # Product API endpoints
│   └── orderRoutes.js        # Order API endpoints
├── utils/
│   └── generateToken.js      # JWT token utility
└── server.js                 # Main server file
```

### 📁 **Frontend Structure**
```
frontend/
├── public/
│   └── index.html           # Main HTML template
├── src/
│   ├── actions/             # Redux actions
│   │   ├── userActions.js
│   │   ├── productActions.js
│   │   └── orderActions.js
│   ├── components/          # Reusable components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── Message.js
│   ├── screens/             # Page components
│   │   ├── HomeScreen.js
│   │   ├── ProductScreen.js
│   │   ├── CartScreen.js
│   │   └── ProfileScreen.js
│   ├── reducers/            # Redux reducers
│   │   ├── userReducers.js
│   │   ├── productReducers.js
│   │   └── orderReducers.js
│   ├── constants/           # Action types
│   ├── utils/
│   ├── styles/             # CSS files
│   ├── store.js            # Redux store
│   └── App.js              # Main App component
└── package.json
```

---

## 7. Key Features Implementation

### 🛒 **E-Commerce Features**

#### **Cart Management**
```javascript
// File: frontend/src/actions/cartActions.js
export const addToCart = (id, qty) => async (dispatch, getState) => {
  try {
    const { data } = await axios.get(`/api/products/${id}`);
    
    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty: Number(qty),
      },
    });

    const { userLogin: { userInfo } } = getState();
    const storageKey = userInfo ? `cartItems_${userInfo._id}` : 'cartItems_guest';
    localStorage.setItem(storageKey, JSON.stringify(getState().cart.cartItems));
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};
```

#### **Order Status Tracking**
```javascript
// File: frontend/src/screens/ProfileScreen.js
const getOrderStatusBadge = (order) => {
  const status = order.currentStatus;
  
  switch (status) {
    case 'pending': return <Badge bg='danger'>Pending Payment</Badge>;
    case 'payment_confirmed': return <Badge bg='info'>Payment Confirmed</Badge>;
    case 'processing': return <Badge bg='warning'>Processing</Badge>;
    case 'shipped': return <Badge bg='primary'>Shipped</Badge>;
    case 'out_for_delivery': return <Badge bg='warning'>Out for Delivery</Badge>;
    case 'delivered': return <Badge bg='success'>Delivered</Badge>;
    case 'cancelled': return <Badge bg='dark'>Cancelled</Badge>;
    default: return <Badge bg='secondary'>Unknown</Badge>;
  }
};
```

### 🤖 **AI Integration**

#### **Gemini AI Chat**
```javascript
// File: backend/config/geminiConfig.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzePrescription = async (imageBuffer) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this medical prescription image and extract:
    1. Patient information
    2. Prescribed medications with dosages
    3. Doctor information
    4. Any special instructions`;

    const result = await model.generateContent([prompt, imageData]);
    return result.response.text();
  } catch (error) {
    console.error('Error analyzing prescription:', error);
    throw error;
  }
};
```

### 💳 **Payment Integration**

#### **Stripe Payment**
```javascript
// File: frontend/src/components/StripeCheckout.js
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCheckout = ({ orderId, totalPrice, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (!error) {
      const { data } = await axios.post('/api/orders/payment-intent', {
        orderId,
        amount: totalPrice * 100, // Convert to cents
      });

      const { error: confirmError } = await stripe.confirmCardPayment(
        data.client_secret,
        { payment_method: paymentMethod.id }
      );

      if (!confirmError) {
        onPaymentSuccess(paymentMethod);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay ${totalPrice}</button>
    </form>
  );
};
```

---

## 🎯 **Technology Stack Summary**

### **Frontend Technologies:**
- **React 18**: Component-based UI library
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Bootstrap 5**: CSS framework
- **Axios**: HTTP client
- **Stripe Elements**: Payment integration

### **Backend Technologies:**
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **Nodemailer**: Email service

### **Development Tools:**
- **Vite**: Build tool
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control
- **VS Code**: Development environment

### **Deployment & DevOps:**
- **Docker**: Containerization
- **PM2**: Process management
- **Nginx**: Reverse proxy
- **SSL/TLS**: Security certificates

---

## 📞 **Support & Maintenance**

### **Performance Optimization:**
- Database indexing for faster queries
- Image optimization and compression
- Code splitting for faster loading
- Caching strategies implementation

### **Security Measures:**
- JWT token authentication
- Password encryption with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting for API endpoints

### **Monitoring & Analytics:**
- Error logging and tracking
- Performance monitoring
- User behavior analytics
- Server health monitoring

---

*This documentation provides a comprehensive overview of the Medi-ghor project architecture. For specific implementation details or troubleshooting, please refer to the individual code files or contact the development team.*

**Project Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Developed by:** Medi-ghor Development Team