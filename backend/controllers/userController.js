import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// @description  Auth user & get token
// @route        POST /api/users/login
// @access       public
const authuser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  res.send({ email, password });
});

export { authuser };
