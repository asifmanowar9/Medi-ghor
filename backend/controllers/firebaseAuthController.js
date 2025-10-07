import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import admin from '../config/firebaseAdmin.js';

// Helper function to generate a secure random password for Firebase users
const generateSecurePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';

  // Ensure at least one character from each required category
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Add more random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

// @desc    Login with Firebase (Email/Password)
// @route   POST /api/users/firebase-login
// @access  Public
const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken, email, name, uid } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      res.status(401);
      throw new Error('Invalid token');
    }

    // Check if user exists in database
    let user = await User.findOne({ email });

    if (user) {
      console.log(`✅ Firebase Login: User found in MongoDB - ${email}`);
      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
        console.log(`✅ Updated firebaseUid for user: ${email}`);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        firebaseUid: user.firebaseUid,
        token: generateToken(user._id),
      });
    } else {
      // Create new user
      console.log(`🆕 Firebase Login: Creating new user in MongoDB - ${email}`);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: generateSecurePassword(), // Secure random password for Firebase users
        firebaseUid: uid,
        authProvider: 'firebase',
        role: 'normal_user',
      });
      console.log(
        `✅ Firebase Login: User created successfully - ${email}, ID: ${user._id}`
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        firebaseUid: user.firebaseUid,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error('Authentication failed: ' + error.message);
  }
});

// @desc    Register with Firebase (Email/Password)
// @route   POST /api/users/firebase-register
// @access  Public
const firebaseRegister = asyncHandler(async (req, res) => {
  const { idToken, name, email, uid } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      res.status(401);
      throw new Error('Invalid token');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`⚠️ Firebase Register: User already exists - ${email}`);
      res.status(400);
      throw new Error('User already exists');
    }

    // Create new user
    console.log(
      `🆕 Firebase Register: Creating new user in MongoDB - ${email}`
    );
    const user = await User.create({
      name,
      email,
      password: generateSecurePassword(), // Secure random password for Firebase users
      firebaseUid: uid,
      authProvider: 'firebase',
      role: 'normal_user',
    });

    if (user) {
      console.log(
        `✅ Firebase Register: User created successfully - ${email}, ID: ${user._id}`
      );
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        firebaseUid: user.firebaseUid,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(401);
    throw new Error('Registration failed: ' + error.message);
  }
});

// @desc    Login with Google
// @route   POST /api/users/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, email, name, uid, photoURL } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      res.status(401);
      throw new Error('Invalid token');
    }

    // Check if user exists in database
    let user = await User.findOne({ email });

    if (user) {
      console.log(`✅ Google Login: User found in MongoDB - ${email}`);
      // Update Firebase UID and photo if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      if (photoURL && !user.avatar) {
        user.avatar = photoURL;
      }
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        firebaseUid: user.firebaseUid,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      // Create new user
      console.log(`🆕 Google Login: Creating new user in MongoDB - ${email}`);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: generateSecurePassword(), // Secure random password for Firebase users
        firebaseUid: uid,
        photoURL: photoURL || '',
        authProvider: 'google',
        role: 'normal_user',
      });
      console.log(
        `✅ Google Login: User created successfully - ${email}, ID: ${user._id}`
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        firebaseUid: user.firebaseUid,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(401);
    throw new Error('Google authentication failed: ' + error.message);
  }
});

export { firebaseLogin, firebaseRegister, googleLogin };
