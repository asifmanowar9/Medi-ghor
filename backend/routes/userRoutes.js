import express from 'express';
const router = express.Router();
import { authuser } from '../controllers/userController.js';

router.post('/login', authuser); // Route to handle user login

export default router;
