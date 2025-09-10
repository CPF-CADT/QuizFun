"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../middleware/validate");
const user_schemas_1 = require("../validations/user.schemas");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const game_controller_1 = require("../controller/game.controller");
const quizzHistory_controller_1 = require("../controller/quizzHistory.controller");
const user_controller_1 = require("../controller/user.controller");
// import { quizRateLimit} from '../middleware/ratelimit.middleware';
const router = express_1.default.Router();
// Note: The global sanitizeInput middleware from app.ts already handles sanitization.
// You no longer need to import it here.
// Auth routes
router.post('/register', (0, validate_1.validate)(user_schemas_1.userSchemas.register), user_controller_1.register);
router.post('/login', (0, validate_1.validate)(user_schemas_1.userSchemas.login), user_controller_1.login);
router.post('/logout', user_controller_1.logout);
router.post('/refresh-token', user_controller_1.refreshToken);
router.post('/google', (0, validate_1.validate)(user_schemas_1.userSchemas.googleAuth), user_controller_1.googleAuthenicate);
// Verification and Password Reset
router.post('/request-code', (0, validate_1.validate)(user_schemas_1.userSchemas.sendVerificationCode), user_controller_1.sendVerificationCode);
router.post('/verify-otp', (0, validate_1.validate)(user_schemas_1.userSchemas.verifyCode), user_controller_1.verifyCode);
router.post('/verify-password-reset-code', (0, validate_1.validate)(user_schemas_1.userSchemas.verifyCode), user_controller_1.verifyPasswordResetCode);
router.post('/reset-password', (0, validate_1.validate)(user_schemas_1.userSchemas.resetPassword), user_controller_1.resetPassword);
// User Profile & Management routes
router.get('/profile', authenicate_middleware_1.authenticateToken, user_controller_1.getProfile);
router.get('/', authenicate_middleware_1.authenticateToken, user_controller_1.getAllUsers); // Example: protected route
router.get('/by-role/:role', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.getUsersByRole), user_controller_1.getUsersByRole);
router.get('/:id', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.getUserById), user_controller_1.getUserById);
router.put('/:id', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.updateUserInfo), user_controller_1.updateUserInfo);
router.get('/search', user_controller_1.searchUsers);
// Game History route related to a user
router.get('/:userId/history', authenicate_middleware_1.authenticateToken, game_controller_1.GameController.getUserHistory);
router.get('/:id/quiz-history', quizzHistory_controller_1.getUserQuizHistory);
exports.default = router;
