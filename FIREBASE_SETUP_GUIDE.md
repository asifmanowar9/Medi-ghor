# Firebase Authentication Integration Guide

## Overview
This guide explains how to set up and use Firebase Authentication (Email/Password and Google Sign-In) in the Medi-ghor project.

## Prerequisites
1. A Firebase account (create one at https://firebase.google.com)
2. Node.js and npm installed
3. Medi-ghor project cloned and dependencies installed

## Setup Instructions

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

### Step 2: Enable Authentication Methods

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** sign-in provider
4. Add your authorized domains (e.g., `localhost` for development)

### Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (</>) to create a web app
4. Register your app with a nickname (e.g., "Medi-ghor Web")
5. Copy the Firebase configuration object

### Step 4: Set Up Frontend Environment Variables

Create or update `.env` file in the **frontend** directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Example:**
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrst
REACT_APP_FIREBASE_AUTH_DOMAIN=medi-ghor.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=medi-ghor
REACT_APP_FIREBASE_STORAGE_BUCKET=medi-ghor.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 5: Set Up Backend Firebase Admin SDK

#### Option A: Using Service Account Key (Recommended for Production)

1. In Firebase Console, go to **Project settings** > **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. **For Development:** Save the JSON file securely (DO NOT commit to git)
5. **For Production:** Copy the entire JSON content as a single-line string

Create or update `.env` file in the **backend** directory:

```env
# Option 1: Use service account key as JSON string (Recommended for production)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40your-project-id.iam.gserviceaccount.com"}'
```

#### Option B: Using Service Account File Path (For Development)

```env
# Option 2: Use path to service account file
GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json
```

### Step 6: Install Dependencies

#### Frontend
```bash
cd frontend
npm install firebase --legacy-peer-deps
```

#### Backend
```bash
cd backend
npm install firebase-admin
```

### Step 7: Update `.gitignore`

Add these lines to your `.gitignore` file:

```gitignore
# Firebase
**/serviceAccountKey.json
**/*-firebase-adminsdk-*.json
.env
.env.local
.env.production
```

## Project Structure

```
Medi-ghor/
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js                 # Firebase client configuration
│   │   ├── actions/
│   │   │   └── userActions.js              # Firebase auth actions
│   │   ├── constants/
│   │   │   └── userConstants.js            # Firebase constants
│   │   └── screens/
│   │       ├── LoginScreen.js              # Updated with Firebase auth
│   │       └── RegisterScreen.js           # Updated with Firebase auth
│   └── .env                                # Frontend environment variables
│
└── backend/
    ├── config/
    │   └── firebaseAdmin.js                # Firebase Admin SDK config
    ├── controllers/
    │   └── firebaseAuthController.js       # Firebase auth controllers
    ├── routes/
    │   └── userRoutes.js                   # Updated with Firebase routes
    ├── models/
    │   └── userModel.js                    # Updated with firebaseUid field
    └── .env                                # Backend environment variables
```

## How It Works

### Authentication Flow

1. **User Action**: User clicks "Continue with Google" or enters email/password
2. **Firebase Auth**: Firebase authenticates the user and returns an ID token
3. **Backend Verification**: Backend verifies the ID token using Firebase Admin SDK
4. **User Sync**: Backend creates or updates user in MongoDB
5. **JWT Token**: Backend generates and returns a JWT token
6. **Session Storage**: User info and JWT stored in localStorage
7. **Protected Routes**: JWT used for subsequent API requests

### API Endpoints

#### POST `/api/users/firebase-login`
- Authenticate existing user with Firebase email/password
- **Body:** `{ idToken, email, name, uid }`
- **Response:** User object with JWT token

#### POST `/api/users/firebase-register`
- Register new user with Firebase email/password
- **Body:** `{ idToken, name, email, uid }`
- **Response:** User object with JWT token

#### POST `/api/users/google-login`
- Authenticate/register user with Google Sign-In
- **Body:** `{ idToken, email, name, uid, photoURL }`
- **Response:** User object with JWT token

## Features

### Email/Password Authentication
- ✅ User registration with Firebase
- ✅ User login with Firebase
- ✅ Password validation
- ✅ Automatic user sync with MongoDB

### Google Sign-In
- ✅ One-click Google authentication
- ✅ Automatic account creation
- ✅ Profile picture support
- ✅ Seamless integration with existing system

### Security Features
- ✅ Firebase ID token verification
- ✅ Secure backend token handling
- ✅ JWT generation for API authentication
- ✅ Automatic user sync between Firebase and MongoDB

## Testing

### Test Firebase Authentication

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm start
```

3. Navigate to http://localhost:3000/login
4. Try the following:
   - Register with email/password (traditional method)
   - Login with email/password (traditional method)
   - Click "Continue with Google" button
   - Verify user appears in both Firebase Console and MongoDB

## Troubleshooting

### Common Issues

#### 1. "Firebase not initialized" error
- **Solution:** Check that all environment variables are set correctly in frontend `.env`
- Restart the development server after adding environment variables

#### 2. "Authentication failed" on backend
- **Solution:** Verify Firebase Admin SDK credentials are correct
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` is set
- Ensure the service account JSON is valid and not corrupted

#### 3. Google Sign-In popup blocked
- **Solution:** Allow popups in browser settings
- Add your domain to authorized domains in Firebase Console

#### 4. CORS errors
- **Solution:** Ensure your domain is added to Firebase authorized domains
- Check backend CORS configuration

#### 5. "User already exists" error
- **Solution:** User is trying to register with an email that already exists
- Direct them to login page instead

### Debug Mode

Enable Firebase debug logging:

**Frontend** (`firebase.js`):
```javascript
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { setLogLevel } from 'firebase/app';

// Enable debug logging
setLogLevel('debug');
```

**Backend** (`firebaseAdmin.js`):
```javascript
// Set environment variable before starting server
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'; // For testing
```

## Security Best Practices

1. **Never commit** `.env` files or service account keys to version control
2. **Use environment variables** for all sensitive configuration
3. **Rotate keys** regularly in production
4. **Enable** Firebase App Check for additional security
5. **Monitor** authentication logs in Firebase Console
6. **Implement** rate limiting on authentication endpoints
7. **Use** Firebase Security Rules for additional protection

## Production Deployment

### Frontend (Vercel/Netlify)
1. Add all `REACT_APP_FIREBASE_*` environment variables in platform settings
2. Ensure build command includes environment variables
3. Add production domain to Firebase authorized domains

### Backend (Heroku/AWS/Digital Ocean)
1. Set `FIREBASE_SERVICE_ACCOUNT_KEY` as environment variable
2. Ensure proper SSL/TLS configuration
3. Configure CORS for your production frontend domain
4. Set up proper logging and monitoring

### Firebase Console
1. Add production domains to authorized domains
2. Configure OAuth consent screen for production
3. Set up monitoring and alerts
4. Review and tighten security rules

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review browser console for client-side errors
3. Check backend server logs for API errors
4. Refer to Firebase documentation
5. Contact the development team

## License

This integration is part of the Medi-ghor project.
