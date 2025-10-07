import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCw0LhNvErl2z5bFA0mF5Uz250UWiw3N40',
  authDomain: 'project-119a.firebaseapp.com',
  projectId: 'project-119a',
  storageBucket: 'project-119a.firebasestorage.app',
  messagingSenderId: '854196615597',
  appId: '1:854196615597:web:f5443a509e69b9c4008924',
  measurementId: 'G-HG3KVN0TBJ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account selection
});

export default app;
