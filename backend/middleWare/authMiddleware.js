import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
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

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Super Admin middleware - full access to everything
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a super admin');
  }
};

// Operator middleware - can access operator and user functions but not super admin functions
const operator = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'operator' || req.user.role === 'super_admin')
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an operator');
  }
};

// Admin or higher middleware - includes both super admin and operator
const adminOrHigher = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'operator' ||
      req.user.role === 'super_admin' ||
      req.user.isAdmin)
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Check if user can modify another user based on roles
const canModifyUser = (currentUserRole, targetUserRole) => {
  if (currentUserRole === 'super_admin') {
    return true; // Super admin can modify anyone
  }
  if (currentUserRole === 'operator') {
    // Operators can modify normal users and legacy users (those without role field)
    return targetUserRole === 'normal_user' || !targetUserRole;
  }
  return false; // Normal users can't modify others
};

export { protect, admin, superAdmin, operator, adminOrHigher, canModifyUser };
