import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { canModifyUser } from '../middleWare/authMiddleware.js';

// @description  Auth user & get token
// @route        POST /api/users/login
// @access       public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @description  register a new user
// @route        POST /api/users
// @access       public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    // Check if this is a validation error
    if (
      error.name === 'ValidationError' &&
      error.errors &&
      error.errors.password
    ) {
      res.status(400);
      throw new Error(error.errors.password.message);
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  }
});

// @description  get user profile
// @route        GET /api/users/profile
// @access       private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
      //   token: generateToken(user._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }

  //   res.send('Success');
});

// @description  update user profile
// @route        PUT /api/users/profile
// @access       private
const updadteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }

  //   res.send('Success');
});

// @description  get all users
// @route        GET /api/users
// @access       private/admin
const getUser = asyncHandler(async (req, res) => {
  let query = {};

  // If the requester is an operator, they should not see super admins
  if (req.user.role === 'operator') {
    query = {
      $or: [
        { role: 'normal_user' },
        { role: 'operator' },
        { role: { $exists: false } }, // Legacy users without role field
        { role: null },
      ],
    };
  }

  const users = await User.find(query);
  console.log(`📋 User List: Found ${users.length} users`);
  console.log(
    `   Firebase users: ${users.filter((u) => u.firebaseUid).length}`
  );
  console.log(
    `   Traditional users: ${users.filter((u) => !u.firebaseUid).length}`
  );
  res.json(users);
});

// @description  delete user
// @route        DELETE /api/users/:id
// @access       private/admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Check if current user can modify target user based on roles
    if (!canModifyUser(req.user.role, user.role)) {
      res.status(403);
      throw new Error('Not authorized to delete this user');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @description  get user by id
// @route        GET /api/users/:id
// @access       private/admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    // If the requester is an operator, they should not see super admin details
    if (req.user.role === 'operator' && user.role === 'super_admin') {
      res.status(404);
      throw new Error('User not found');
    }

    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @description  update user
// @route        PUT /api/users/:id
// @access       private/admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Check if current user can modify target user based on roles
    if (!canModifyUser(req.user.role, user.role)) {
      res.status(403);
      throw new Error('Not authorized to update this user');
    }

    // Role assignment rules
    const newRole = req.body.role;
    if (newRole) {
      // Only super admin can assign super admin or operator roles
      if (
        (newRole === 'super_admin' || newRole === 'operator') &&
        req.user.role !== 'super_admin'
      ) {
        res.status(403);
        throw new Error('Not authorized to assign this role');
      }
      user.role = newRole;
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin =
      req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  authUser,
  getUserProfile,
  registerUser,
  updadteUserProfile,
  getUser,
  deleteUser,
  getUserById,
  updateUser,
};
