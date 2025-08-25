import express from 'express';
import { validate } from '../middleware/validate';
import { userSchemas } from '../validations/user.schemas';
import { authenticateToken } from '../middleware/authenicate.middleware';
import { GameController } from '../controller/game.controller';
import {
    getAllUsers,
    getUsersByRole,
    register,
    login,
    updateUserInfo,
    sendVerificationCode,
    verifyCode,
    refreshToken,
    logout,
    verifyPasswordResetCode,
    resetPassword,
    getProfile,
    googleAuthenicate,
    getUserById
} from '../controller/user.controller';
import { globalRateLimit ,quizRateLimit} from '../middleware/ratelimit.middleware';
const router = express.Router();

// Note: The global sanitizeInput middleware from app.ts already handles sanitization.
// You no longer need to import it here.

// Auth routes
router.post('/register',globalRateLimit, validate(userSchemas.register), register);
router.post('/login',globalRateLimit, validate(userSchemas.login), login);
router.post('/logout',globalRateLimit, logout);
router.post('/refresh-token',globalRateLimit, refreshToken);
router.post('/google', validate(userSchemas.googleAuth),globalRateLimit, googleAuthenicate);

// Verification and Password Reset
router.post('/request-code', validate(userSchemas.sendVerificationCode),globalRateLimit, sendVerificationCode);
router.post('/verify-otp', validate(userSchemas.verifyCode),globalRateLimit, verifyCode);
router.post('/verify-password-reset-code', validate(userSchemas.verifyCode),globalRateLimit, verifyPasswordResetCode);
router.post('/reset-password', validate(userSchemas.resetPassword),globalRateLimit, resetPassword);

// User Profile & Management routes
router.get('/profile', authenticateToken,globalRateLimit, getProfile);
router.get('/', authenticateToken,globalRateLimit, getAllUsers); // Example: protected route
router.get('/by-role/:role', authenticateToken, validate(userSchemas.getUsersByRole),globalRateLimit, getUsersByRole);
router.get('/:id', authenticateToken, validate(userSchemas.getUserById),globalRateLimit, getUserById);
router.put('/:id', authenticateToken, validate(userSchemas.updateUserInfo),globalRateLimit, updateUserInfo);

// Game History route related to a user
router.get('/:userId/history', authenticateToken,globalRateLimit, GameController.getUserHistory);

export default router;