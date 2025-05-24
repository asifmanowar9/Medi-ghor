# Medi-ghor

An e-commerce platform with medical test report analysis capabilities powered by AI.

![Medi-ghor Screenshot](screenshot.png)

## Overview

Medi-ghor is a full-stack MERN application that combines e-commerce functionality for medical products with advanced AI-powered medical test report analysis. The platform allows users to:

- Browse and purchase medical products
- Upload medical test reports for AI analysis
- Chat with an AI assistant about health concerns
- Manage their orders and profile

For administrators, the platform provides:

- Product management (create, update, delete)
- User management
- Order management
- Access to analytics

## Tech Stack

### Frontend

- React.js
- Redux for state management
- React Bootstrap for UI components
- React Router for navigation
- Axios for API requests

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

### AI Features

- Google Gemini AI integration for medical report analysis
- OCR.Space API for text extraction from images
- Custom medical data processing pipeline

## Features

### E-Commerce

- Product catalog with search and pagination
- Product details with reviews
- Shopping cart functionality
- Secure checkout process
- Order history and tracking

### Medical Test Analysis

- Upload test reports as images
- AI-powered OCR to extract data from reports
- Detailed analysis of medical test values
- Identification of abnormal values
- Medical recommendations based on results

### Chat Interface

- Real-time chat with AI assistant
- Medical image analysis within chat
- Collapsible analysis results
- Support for different AI models (Gemini, OCR.Space)
- Confidence indicators for analysis results

### User Management

- User registration and authentication
- Profile management
- Order history
- Address management

### Admin Dashboard

- Product management (CRUD operations)
- User management
- Order management
- Sales analytics

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/medi-ghor.git
cd medi-ghor

npm install
cd frontend
npm install
cd ..
```
