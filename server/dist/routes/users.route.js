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
const user_controller_1 = require("../controller/user.controller");
const ratelimit_middleware_1 = require("../middleware/ratelimit.middleware");
const router = express_1.default.Router();
// Note: The global sanitizeInput middleware from app.ts already handles sanitization.
// You no longer need to import it here.
// Auth routes
router.post('/register', ratelimit_middleware_1.globalRateLimit, (0, validate_1.validate)(user_schemas_1.userSchemas.register), user_controller_1.register);
router.post('/login', ratelimit_middleware_1.globalRateLimit, (0, validate_1.validate)(user_schemas_1.userSchemas.login), user_controller_1.login);
router.post('/logout', ratelimit_middleware_1.globalRateLimit, user_controller_1.logout);
router.post('/refresh-token', ratelimit_middleware_1.globalRateLimit, user_controller_1.refreshToken);
router.post('/google', (0, validate_1.validate)(user_schemas_1.userSchemas.googleAuth), ratelimit_middleware_1.globalRateLimit, user_controller_1.googleAuthenicate);
// Verification and Password Reset
router.post('/request-code', (0, validate_1.validate)(user_schemas_1.userSchemas.sendVerificationCode), ratelimit_middleware_1.globalRateLimit, user_controller_1.sendVerificationCode);
router.post('/verify-otp', (0, validate_1.validate)(user_schemas_1.userSchemas.verifyCode), ratelimit_middleware_1.globalRateLimit, user_controller_1.verifyCode);
router.post('/verify-password-reset-code', (0, validate_1.validate)(user_schemas_1.userSchemas.verifyCode), ratelimit_middleware_1.globalRateLimit, user_controller_1.verifyPasswordResetCode);
router.post('/reset-password', (0, validate_1.validate)(user_schemas_1.userSchemas.resetPassword), ratelimit_middleware_1.globalRateLimit, user_controller_1.resetPassword);
// User Profile & Management routes
router.get('/profile', authenicate_middleware_1.authenticateToken, ratelimit_middleware_1.globalRateLimit, user_controller_1.getProfile);
router.get('/', authenicate_middleware_1.authenticateToken, ratelimit_middleware_1.globalRateLimit, user_controller_1.getAllUsers); // Example: protected route
router.get('/by-role/:role', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.getUsersByRole), ratelimit_middleware_1.globalRateLimit, user_controller_1.getUsersByRole);
router.get('/:id', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.getUserById), ratelimit_middleware_1.globalRateLimit, user_controller_1.getUserById);
router.put('/:id', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(user_schemas_1.userSchemas.updateUserInfo), ratelimit_middleware_1.globalRateLimit, user_controller_1.updateUserInfo);
// Game History route related to a user
router.get('/:userId/history', authenicate_middleware_1.authenticateToken, ratelimit_middleware_1.globalRateLimit, game_controller_1.GameController.getUserHistory);
exports.default = router;
