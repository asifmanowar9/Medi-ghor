# Medi-ghor

A comprehensive medical e-commerce platform with AI-powered health assistance, test report analysis, and prescription management.

![Medi-ghor Screenshot](screenshot.png)

## Overview

Medi-ghor is a full-stack MERN application designed to revolutionize the way people access medical products and healthcare information. The platform seamlessly combines e-commerce functionality with cutting-edge AI capabilities, enabling users to shop for medicines, get AI-powered health consultations, and manage their medical records—all in one place.

### For Users

- 🛒 Browse and purchase authentic medical products
- 🤖 Chat with AI medical assistant for health guidance
- 📊 Upload and analyze medical test reports using AI
- 📋 Store and manage digital prescriptions
- 📦 Track orders in real-time with detailed status updates
- ❤️ Wishlist for out-of-stock products with restock notifications

### For Administrators

- 📦 Complete product management (CRUD operations)
- 👥 User management and role assignments
- 📊 Order management with status workflow
- 🎨 Banner management for promotions
- 📈 Sales and inventory analytics

## Tech Stack

### Frontend

- **React.js** - UI library with functional components and hooks
- **Redux** - Centralized state management with actions/reducers pattern
- **React Bootstrap** - Responsive UI components
- **React Router v6** - Client-side navigation
- **Axios** - HTTP client for API communication
- **Stripe.js** - Secure payment processing

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Firebase Admin** - Social authentication (Google, Email)
- **Nodemailer** - Email notifications

### AI & Analysis

- **Google Gemini AI** - Medical chat and test report analysis
- **OCR.Space API** - Text extraction from medical images
- **Custom Medical Pipeline** - Intelligent health data processing

## Features

### 🏪 E-Commerce

- **Product Catalog** - Search, filter by category/brand, pagination
- **Product Details** - Comprehensive info with reviews and ratings
- **Shopping Cart** - Add/remove items, quantity management
- **Secure Checkout** - Multi-step process with Stripe integration
- **Order Tracking** - Real-time status updates (pending → processing → shipped → delivered)
- **Inventory Management** - Automatic stock updates on orders

### 🤖 AI Medical Chat

- **Conversational AI** - Chat with Gemini-powered medical assistant
- **Test Report Analysis** - Upload images for AI-powered interpretation
- **OCR Integration** - Extract text from medical documents
- **Chat History** - Persistent conversations with search and filtering
- **Confidence Indicators** - Reliability scores for AI responses
- **Medical Recommendations** - Personalized health suggestions

### 📋 Prescription Management

- **Digital Storage** - Upload and store prescription images
- **Metadata Tracking** - Doctor name, hospital, validity dates
- **Medication Lists** - Track prescribed medications
- **Easy Access** - Quick retrieval when ordering medicines

### ❤️ Wishlist & Notifications

- **Out-of-Stock Alerts** - Add unavailable products to wishlist
- **Email Notifications** - Get notified when products are restocked
- **Smart Inventory** - Automatic notification triggers

### 👤 User Management

- **Multiple Auth Methods** - Email/password and Firebase (Google) login
- **Email Verification** - Secure account activation
- **Password Recovery** - Forgot password with email reset
- **Profile Management** - Update personal information
- **Order History** - View all past orders

### 🔧 Admin Dashboard

- **Product Management** - Create, edit, delete products with images
- **Category & Brand Management** - Organize product catalog
- **User Administration** - View users, assign admin roles
- **Order Workflow** - Update order status through lifecycle
- **Banner Management** - Create promotional banners
- **Health Conditions** - Manage health category data

### 🎨 UI/UX Features

- **Responsive Design** - Mobile-first, works on all devices
- **Hero Banner Carousel** - Dynamic promotional slides
- **Featured Categories** - Quick navigation to popular categories
- **Product Sections** - Organized display of products
- **Modern Header** - Intuitive navigation with search
- **Checkout Steps** - Clear progress indication

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn
- Stripe account (for payments)
- Google Cloud account (for Gemini AI)
- OCR.Space API key
- Firebase project (for social auth)

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# OCR.Space
OCR_SPACE_API_KEY=your_ocr_space_api_key

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/medi-ghor.git
cd medi-ghor
```

2. Install dependencies:

```bash
npm install
cd frontend
npm install
cd ..
```

3. Seed the database (optional):

```bash
npm run data:import
```

4. Run the application:

```bash
# Run backend and frontend concurrently
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

## API Endpoints

### Products

| Method | Endpoint               | Description              | Access  |
| ------ | ---------------------- | ------------------------ | ------- |
| GET    | /api/products          | Get all products         | Public  |
| GET    | /api/products/:id      | Get product by ID        | Public  |
| POST   | /api/products          | Create product           | Admin   |
| PUT    | /api/products/:id      | Update product           | Admin   |
| DELETE | /api/products/:id      | Delete product           | Admin   |

### Users

| Method | Endpoint               | Description              | Access  |
| ------ | ---------------------- | ------------------------ | ------- |
| POST   | /api/users/login       | User login               | Public  |
| POST   | /api/users/register    | User registration        | Public  |
| GET    | /api/users/profile     | Get user profile         | Private |
| PUT    | /api/users/profile     | Update user profile      | Private |

### Orders

| Method | Endpoint               | Description              | Access  |
| ------ | ---------------------- | ------------------------ | ------- |
| POST   | /api/orders            | Create order             | Private |
| GET    | /api/orders/:id        | Get order by ID          | Private |
| GET    | /api/orders/myorders   | Get logged-in user orders| Private |
| PUT    | /api/orders/:id/status | Update order status      | Admin   |

### Chat

| Method | Endpoint               | Description              | Access  |
| ------ | ---------------------- | ------------------------ | ------- |
| POST   | /api/chats             | Create new chat          | Private |
| GET    | /api/chats             | Get user's chats         | Private |
| POST   | /api/chats/:id/message | Send message to chat     | Private |

## Project Structure

```
medi-ghor/
├── backend/
│   ├── config/         # Database, email, AI configurations
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handling, file uploads
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── actions/    # Redux actions
│       ├── components/ # Reusable UI components
│       ├── reducers/   # Redux reducers
│       ├── screens/    # Page components
│       ├── styles/     # CSS files
│       └── store.js    # Redux store
├── uploads/            # User uploaded files
└── docs/               # Documentation and diagrams
```

## Screenshots

### Home Page
- Hero banner with promotional slides
- Featured categories and product sections
- Modern, responsive design

### AI Chat
- Conversational interface for health queries
- Test report image upload and analysis
- Detailed medical insights

### Order Tracking
- Visual progress indicators
- Real-time status updates
- Complete order timeline

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for medical analysis capabilities
- OCR.Space for text extraction services
- React Bootstrap for UI components
- MongoDB Atlas for database hosting
