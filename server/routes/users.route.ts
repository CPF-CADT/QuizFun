import express from 'express';
import {
  register,
  login,
  updateUserInfo,
  sendVerificationCode,
  verifyCode, // unified function
  refreshToken,
  logout,
  getAllUsers,
  getUsersByRole,
} from '../controller/user.controller';
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';

export const userRouter = express.Router();

// User management routes
userRouter.get('/', authenticateToken, getAllUsers);
userRouter.get('/by-role/:role', authenticateToken, getUsersByRole);

// Auth routes
userRouter.post('/register', register);
userRouter.post('/login', isEmailVerified, login);
userRouter.put('/:id', authenticateToken, updateUserInfo);
userRouter.post('/request-otp', sendVerificationCode);

// Unified verification route for both `/verify-otp` and `/verify-code`
userRouter.post('/verify-otp', verifyCode);
userRouter.post('/verify-code', verifyCode);

userRouter.post('/refresh-token', refreshToken);
userRouter.post('/logout', logout);
