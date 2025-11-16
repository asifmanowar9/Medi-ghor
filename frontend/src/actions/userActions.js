import {
  USER_DETAILS_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_DETAILS_RESET,
  USER_LIST_REQUEST,
  USER_LIST_SUCCESS,
  USER_LIST_FAIL,
  USER_LIST_RESET,
  USER_DELETE_FAIL,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL,
  USER_FIREBASE_LOGIN_REQUEST,
  USER_FIREBASE_LOGIN_SUCCESS,
  USER_FIREBASE_LOGIN_FAIL,
  USER_FIREBASE_REGISTER_REQUEST,
  USER_FIREBASE_REGISTER_SUCCESS,
  USER_FIREBASE_REGISTER_FAIL,
  USER_GOOGLE_LOGIN_REQUEST,
  USER_GOOGLE_LOGIN_SUCCESS,
  USER_GOOGLE_LOGIN_FAIL,
} from '../constants/userConstants';

import { ORDER_LIST_MY_RESET } from '../constants/orderConstants';
import { CART_ADD_ITEM } from '../constants/cartConstants';
import { loadUserCart, clearCart } from '../actions/cartActions';
import {
  syncWishlistWithBackend,
  clearWishlist,
} from '../actions/wishlistActions';

import axios from 'axios';

// Firebase imports
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/users/login',
      { email, password },
      config
    );

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));

    // Load this user's cart after successful login
    dispatch(loadUserCart());

    // Sync wishlist with backend after successful login
    dispatch(syncWishlistWithBackend());
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });

    // Re-throw the error so it can be caught in LoginScreen
    throw error;
  }
};

export const logout = () => async (dispatch, getState) => {
  // Save guest cart if there are items in it before logging out
  const {
    cart: { cartItems },
  } = getState();
  if (cartItems.length > 0) {
    localStorage.setItem('cartItems_guest', JSON.stringify(cartItems));
  }

  // Sign out from Firebase
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase signout error:', error);
  }

  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: USER_DETAILS_RESET });
  dispatch({ type: ORDER_LIST_MY_RESET });
  dispatch({ type: USER_LIST_RESET });

  // Clear the cart and load guest cart if exists
  dispatch(clearCart());

  // Clear the wishlist on logout
  dispatch(clearWishlist());
  const guestCartItems = localStorage.getItem('cartItems_guest')
    ? JSON.parse(localStorage.getItem('cartItems_guest'))
    : [];

  if (guestCartItems.length > 0) {
    dispatch({
      type: CART_ADD_ITEM,
      payload: { cartItems: guestCartItems },
      isFullReplace: true,
    });
  }
};

// Firebase Email/Password Login
export const firebaseLogin = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_FIREBASE_LOGIN_REQUEST });

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      // Send verification email if not sent already
      await sendEmailVerification(firebaseUser);

      dispatch({
        type: USER_FIREBASE_LOGIN_FAIL,
        payload:
          'Please verify your email before logging in. A verification email has been sent.',
      });

      return { needsVerification: true };
    }

    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    // Send token to backend for verification and user sync
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/users/firebase-login',
      {
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        uid: firebaseUser.uid,
      },
      config
    );

    dispatch({
      type: USER_FIREBASE_LOGIN_SUCCESS,
      payload: data,
    });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));

    // Load user's cart after successful login
    dispatch(loadUserCart());

    // Sync wishlist with backend after successful login
    dispatch(syncWishlistWithBackend());
  } catch (error) {
    const errorMessage =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : error.code === 'auth/wrong-password'
        ? 'Invalid password'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/user-disabled'
        ? 'This account has been disabled'
        : error.message || 'Login failed';

    dispatch({
      type: USER_FIREBASE_LOGIN_FAIL,
      payload: errorMessage,
    });

    // Re-throw the error so it can be caught in LoginScreen
    throw error;
  }
};

// Firebase Email/Password Registration with Email Verification
export const firebaseRegister = (name, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_FIREBASE_REGISTER_REQUEST });

    // Create user with Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Try to sync with backend (optional - will work without backend for now)
    try {
      const idToken = await firebaseUser.getIdToken();
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/firebase-register',
        {
          idToken,
          name,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        },
        config
      );

      dispatch({
        type: USER_FIREBASE_REGISTER_SUCCESS,
        payload: data,
      });

      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: data,
      });
    } catch (backendError) {
      console.warn(
        'Backend sync failed, but Firebase account created:',
        backendError
      );
      // Continue anyway - account is created in Firebase
      dispatch({
        type: USER_FIREBASE_REGISTER_SUCCESS,
        payload: { email: firebaseUser.email, name },
      });
    }

    // Note: We don't auto-login until email is verified
    // The verification screen will handle the redirect

    return { success: true, needsVerification: true };
  } catch (error) {
    // If Firebase account creation fails, show error
    const errorMessage =
      error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists. Please login instead or use a different email.'
        : error.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/operation-not-allowed'
        ? 'Email/Password authentication is not enabled. Please enable it in Firebase Console.'
        : error.message || 'Registration failed';

    dispatch({
      type: USER_FIREBASE_REGISTER_FAIL,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

// Google Sign-In
export const googleLogin = () => async (dispatch) => {
  try {
    dispatch({ type: USER_GOOGLE_LOGIN_REQUEST });

    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    // Send token to backend for verification and user sync
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/users/google-login',
      {
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL,
      },
      config
    );

    dispatch({
      type: USER_GOOGLE_LOGIN_SUCCESS,
      payload: data,
    });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));

    // Load user's cart after successful login
    dispatch(loadUserCart());

    // Sync wishlist with backend after successful login
    dispatch(syncWishlistWithBackend());
  } catch (error) {
    const errorMessage =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed'
        : error.code === 'auth/cancelled-popup-request'
        ? 'Another popup is already open'
        : error.code === 'auth/popup-blocked'
        ? 'Sign-in popup was blocked by browser'
        : error.message || 'Google sign-in failed';

    dispatch({
      type: USER_GOOGLE_LOGIN_FAIL,
      payload: errorMessage,
    });

    // Re-throw the error so it can be caught in LoginScreen
    throw error;
  }
};

export const register = (name, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/users',
      { name, email, password },
      config
    );

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/users/${id}`, config);

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_PROFILE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/users/profile`, user, config);

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: data,
    });

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listUsers = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/users`, config);

    dispatch({
      type: USER_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/users/${id}`, config);

    dispatch({ type: USER_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: USER_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateUser = (user) => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_UPDATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/users/${user._id}`, user, config);

    dispatch({
      type: USER_UPDATE_SUCCESS,
      //payload: data,
    });

    dispatch({
      type: USER_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
