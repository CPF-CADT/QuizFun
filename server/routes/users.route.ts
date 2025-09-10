import express from 'express';
import { validate } from '../middleware/validate';
import { userSchemas } from '../validations/user.schemas';
import { authenticateToken } from '../middleware/authenicate.middleware';
import { GameController } from '../controller/game.controller';
import { getUserQuizHistory } from '../controller/quizzHistory.controller';
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
    getUserById,
    searchUsers
} from '../controller/user.controller';
// import { quizRateLimit} from '../middleware/ratelimit.middleware';
const router = express.Router();

// Note: The global sanitizeInput middleware from app.ts already handles sanitization.
// You no longer need to import it here.

// Auth routes
router.post('/register', validate(userSchemas.register), register);
router.post('/login', validate(userSchemas.login), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/google', validate(userSchemas.googleAuth), googleAuthenicate);

// Verification and Password Reset
router.post('/request-code', validate(userSchemas.sendVerificationCode), sendVerificationCode);
router.post('/verify-otp', validate(userSchemas.verifyCode), verifyCode);
router.post('/verify-password-reset-code', validate(userSchemas.verifyCode), verifyPasswordResetCode);
router.post('/reset-password', validate(userSchemas.resetPassword), resetPassword);

// User Profile & Management routes
router.get('/profile', authenticateToken, getProfile);
router.get('/', authenticateToken, getAllUsers); // Example: protected route
router.get('/by-role/:role', authenticateToken, validate(userSchemas.getUsersByRole), getUsersByRole);
router.get('/:id', authenticateToken, validate(userSchemas.getUserById), getUserById);
router.put('/:id', authenticateToken, validate(userSchemas.updateUserInfo), updateUserInfo);
router.get('/search', searchUsers);

// Game History route related to a user
router.get('/:userId/history', authenticateToken, GameController.getUserHistory);

router.get('/:id/quiz-history', getUserQuizHistory);

export default router;