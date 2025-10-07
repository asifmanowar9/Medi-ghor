import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
// and either:
// 1. Set the path in GOOGLE_APPLICATION_CREDENTIALS environment variable
// 2. Or provide the service account object directly

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized successfully'.green);
    } catch (error) {
      console.error(
        '❌ Firebase Admin SDK initialization failed:'.red,
        error.message
      );
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // If GOOGLE_APPLICATION_CREDENTIALS is set, it will be used automatically
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log('✅ Firebase Admin SDK initialized successfully'.green);
    } catch (error) {
      console.error(
        '❌ Firebase Admin SDK initialization failed:'.red,
        error.message
      );
    }
  } else {
    console.warn(
      '⚠️  Firebase Admin SDK not initialized. Please set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.'
        .yellow
    );
  }
}

export default admin;
