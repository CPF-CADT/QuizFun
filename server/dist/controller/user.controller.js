"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getUsersByRole = getUsersByRole;
exports.register = register;
exports.login = login;
exports.updateUserInfo = updateUserInfo;
exports.sendVerificationCode = sendVerificationCode;
exports.verifyCode = verifyCode;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.verifyPasswordResetCode = verifyPasswordResetCode;
exports.resetPassword = resetPassword;
exports.getProfile = getProfile;
exports.googleAuthenicate = googleAuthenicate;
exports.getUserById = getUserById;
exports.searchUsers = searchUsers;
const encription_1 = require("../service/encription");
const users_repositories_1 = require("../repositories/users.repositories");
const generateRandomNumber_1 = require("../service/generateRandomNumber");
const transporter_1 = require("../service/transporter");
const verification_repositories_1 = require("../repositories/verification.repositories");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import redisClient from "../config/redis";
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../config/config");
const mongoose_1 = require("mongoose");
const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRATION = "15m";
const client = new google_auth_library_1.OAuth2Client(config_1.config.googleClientID);
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *         name:
 *           type: string
 *           example: Alice Doe
 *         email:
 *           type: string
 *           format: email
 *           example: alice@example.com
 *         password:
 *           type: string
 *           example: hashed_password_123
 *         role:
 *           type: string
 *           example: user
 *         profile_url:
 *           type: string
 *           format: uri
 *           example: https://example.com/profile.jpg
 *         google_id:
 *           type: string
 *           nullable: true
 *           example: google-uid-001
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 10
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: refreshToken
 */
/* ----------------------- GET ALL USERS ----------------------- */
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       500:
 *         description: Server error
 */
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const search = req.query.search;
        try {
            const result = yield users_repositories_1.UserRepository.getAllUsers(page, limit, search);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to fetch users",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
/* ----------------------- GET USERS BY ROLE ----------------------- */
/**
 * @swagger
 * /api/user/by-role/{role}:
 *   get:
 *     summary: Get users by role with pagination
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [player, admin, moderator]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of users with specified role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       400:
 *         description: Invalid role
 *       500:
 *         description: Server error
 */
function getUsersByRole(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { role } = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const validRoles = ["player", "admin", "moderator"];
        if (!validRoles.includes(role)) {
            res
                .status(400)
                .json({
                message: "Invalid role. Must be one of: player, admin, moderator",
            });
            return;
        }
        try {
            const result = yield users_repositories_1.UserRepository.getUsersByRole(role, page, limit);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to fetch users by role",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
/* ----------------------- REGISTER ----------------------- */
/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               profile_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, profile_url, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing required user information' });
        }
        let createdUser;
        const hashedPassword = yield encription_1.Encryption.hashPassword(password);
        try {
            createdUser = yield users_repositories_1.UserRepository.create({
                name,
                email,
                password: hashedPassword,
                profileUrl: profile_url || 'http://default.url/image.png',
                role: role || 'player',
                isVerified: false,
            });
        }
        catch (err) {
            return res.status(409).json({ error: 'Email is already used' }); // Use 409 Conflict for existing resources
        }
        const code = (0, generateRandomNumber_1.generateRandomNumber)(6);
        const subject = 'Verify Your Email Address';
        const htmlContent = `<p>Welcome! Your verification code is: <strong>${code}</strong></p>`;
        yield Promise.all([
            verification_repositories_1.VerificationCodeRepository.create(createdUser.id, code, (0, generateRandomNumber_1.getExpiryDate)(15)),
            (0, transporter_1.sentEmail)(email, subject, '', htmlContent)
        ]);
        return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    });
}
/* ----------------------- LOGIN ----------------------- */
/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Incorrect password
 *       403:
 *         description: Account not verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        const user = yield users_repositories_1.UserRepository.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!user.isVerified) {
            res
                .status(403)
                .json({ message: "Account not verified. Please check your email." });
            return;
        }
        const isPasswordValid = yield encription_1.Encryption.verifyPassword(user.password, password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Incorrect password" });
            return;
        }
        yield handleSuccessfulLogin(user, res);
    });
}
/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update user information by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               profile_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/new-profile.jpg
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User update successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: No update data provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
function updateUserInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        const { name, password, profileUrl } = req.body;
        if (!name && !password && !profileUrl) {
            res.status(400).json({ message: "No update data provided" });
            return;
        }
        const dataToUpdate = {};
        if (name)
            dataToUpdate.name = name;
        if (profileUrl)
            dataToUpdate.profileUrl = profileUrl;
        // Only hash and add the password if a new one was provided
        if (password) {
            dataToUpdate.password = yield encription_1.Encryption.hashPassword(password);
        }
        const updatedUser = yield users_repositories_1.UserRepository.update(id, dataToUpdate);
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const _a = updatedUser.toObject(), { password: _ } = _a, userResponse = __rest(_a, ["password"]);
        res.status(200).json({
            message: "User updated successfully",
            user: userResponse,
        });
    });
}
/**
 * @swagger
 * /api/user/request-code:
 *   post:
 *     summary: Send a verification code to email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *     responses:
 *       201:
 *         description: Verification code sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 err:
 *                   type: string
 *                   example: server fail + error message
 */
function sendVerificationCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const { email } = body;
        const userTemp = yield users_repositories_1.UserRepository.findByEmail(email);
        if (!userTemp) {
            res.status(404).json({ message: "Email not register yet!" });
            return;
        }
        try {
            yield verification_repositories_1.VerificationCodeRepository.delete(userTemp.id);
        }
        catch (err) {
            console.error("Error when sent 2FA");
        }
        const code = (0, generateRandomNumber_1.generateRandomNumber)(6);
        yield verification_repositories_1.VerificationCodeRepository.create(email, code, (0, generateRandomNumber_1.getExpiryDate)(5));
        const subject = "Email Verification Code";
        const text = `Your verification code is: ${code}`;
        const htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
        yield (0, transporter_1.sentEmail)(email, subject, text, htmlContent);
        res.status(201).json({ message: "Verification code sent successfully!" });
        return;
    });
}
/* ----------------------- VERIFY EMAIL ----------------------- */
/**
 * @swagger
 * /api/user/verify-otp:
 *   post:
 *     summary: Verify email with code
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
function verifyCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, code } = req.body;
        if (!email || !code) {
            res.status(400).json({ message: "Email and code are required." });
            return;
        }
        const user = yield users_repositories_1.UserRepository.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const verificationToken = yield verification_repositories_1.VerificationCodeRepository.find(user.id.toString(), code);
        if (!verificationToken) {
            res.status(401).json({ message: "Invalid or expired code." });
            return;
        }
        yield users_repositories_1.UserRepository.update(user.id.toString(), { isVerified: true });
        yield verification_repositories_1.VerificationCodeRepository.delete(verificationToken.id);
        const successMessage = "Verification successful. You are now logged in.";
        yield handleSuccessfulLogin(user, res, successMessage);
    });
}
/**
 * @swagger
 * /api/user/refresh-token:
 *   post:
 *     summary: Refresh access token using cookie
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Missing refresh token
 *       403:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
// export async function refreshToken(req: Request, res: Response): Promise<void> {
//   const oldRefreshToken = req.cookies.refreshToken;
//   if (!oldRefreshToken) {
//     res.status(401).json({ message: "Refresh token missing" });
//     return;
//   }
//   let decodedUser;
//   try {
//     decodedUser = JWT.verifyRefreshToken(oldRefreshToken) as {
//       id: string;
//       email?: string;
//       role: string;
//     };
//   } catch (err) {
//     console.error("Refresh attempt failed: Token verification error.", err);
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });
//     res.status(403).json({ message: "Invalid or expired refresh token" });
//     return;
//   }
//   try {
//     const storedToken = await redisClient.get(`refreshToken:${decodedUser.id}`);
//     if (!storedToken) {
//         res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none" });
//         res.status(403).json({ message: "Session not found. Please log in again." });
//         return
//     }
//     if (storedToken !== oldRefreshToken) {
//       console.warn(
//         `SECURITY ALERT: Refresh token reuse detected for user ${decodedUser.id}. Invalidating session.`
//       );
//       await redisClient.del(`refreshToken:${decodedUser.id}`);
//       res.clearCookie("refreshToken", {
//         httpOnly: true,
//         secure: true,
//         sameSite: "none",
//       });
//       res
//         .status(403)
//         .json({ message: "Session invalid. Please log in again." });
//       return;
//     }
//     const newTokens = JWT.createTokens({
//       id: decodedUser.id,
//       email: decodedUser.email,
//       role: decodedUser.role,
//     });
//     // Set the new token in Redis with the 7-day expiration
//     await redisClient.set(
//       `refreshToken:${decodedUser.id}`,
//       newTokens.refreshToken,
//       {
//         PX: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
//       }
//     );
//     // Set the new cookie on the client
//     res.cookie("refreshToken", newTokens.refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
//     });
//     res.status(200).json({ accessToken: newTokens.accessToken });
//   } catch (err) {
//     console.error(
//       `CRITICAL: Error during token refresh process for user ${decodedUser.id}:`,
//       err
//     );
//     res
//       .status(500)
//       .json({ message: "Internal server error during token refresh" });
//   }
// }
function refreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401).json({ message: "Refresh token missing" });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtRefreshSecret);
        }
        catch (err) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
            });
            res.status(403).json({ message: "Invalid or expired refresh token" });
            return;
        }
        try {
            // No Redis check, just issue new access token
            const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, config_1.config.jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRATION });
            res.status(200).json({ accessToken });
        }
        catch (err) {
            res.status(500).json({ message: "Internal server error during token refresh" });
        }
    });
}
/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout user and clear cookie
 *     tags: [User]
 *     description: >
 *       Logs the user out by removing their refresh token from Redis and clearing
 *       the HTTP-only cookie.
 *       - If the refresh token is missing, invalid, expired, or already removed,
 *         an error response is returned.
 *       - No request body required.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       400:
 *         description: Invalid request (e.g., already logged out or no refresh token provided)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Already logged out or invalid token
 *       401:
 *         description: Unauthorized (invalid or expired refresh token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 *       500:
 *         description: Server error
 */
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        };
        // Clear refresh token cookie
        res.clearCookie("refreshToken", cookieOptions);
        // No Redis cleanup needed since we don’t store refresh tokens
        res.status(200).json({ message: "Logout successful" });
    });
}
/**
 * @swagger
 * /api/user/verify-password-reset-code:
 *   post:
 *     summary: Verify a password reset code sent to the user's email
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Code verified"
 *                 resetToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email or code."
 */
function verifyPasswordResetCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, code } = req.body;
        const user = yield users_repositories_1.UserRepository.findByEmail(email);
        if (!user)
            return res.status(400).json({ message: "Invalid email or code." });
        const verification = yield verification_repositories_1.VerificationCodeRepository.find(user.id.toString(), code);
        if (!verification)
            return res.status(400).json({ message: "Invalid or expired code." });
        yield verification_repositories_1.VerificationCodeRepository.delete(verification.id);
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id, type: "password_reset" }, config_1.config.jwtSecretResetPassword, { expiresIn: "10m" });
        res.status(200).json({ message: "Code verified", resetToken });
    });
}
/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Reset user password using a valid reset token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               newPassword:
 *                 type: string
 *                 example: "NewSecurePassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or expired token"
 *       401:
 *         description: Password and confirm password do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password and confirm password must be the same."
 */
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { resetToken, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res
                .status(401)
                .json({ message: "Password and confirm password must be the same." });
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(resetToken, config_1.config.jwtSecretResetPassword);
            if (payload.type !== "password_reset") {
                res.status(400).json({ message: "Invalid token type" });
                return;
            }
            const hashedPassword = yield encription_1.Encryption.hashPassword(newPassword);
            yield users_repositories_1.UserRepository.update(payload.id, { password: hashedPassword });
            res.status(200).json({ message: "Password reset successfully" });
        }
        catch (err) {
            res.status(400).json({ message: "Invalid or expired token" });
        }
    });
}
/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f1b6e5c8d1f9d8a7b12345"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-08-31T12:34:56.789Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-09-01T14:20:00.123Z"
 *       401:
 *         description: Unauthorized - No user ID found in token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: No user ID found in token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error while fetching profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error while fetching profile"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */
function getProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                res
                    .status(401)
                    .json({ message: "Unauthorized: No user ID found in token" });
                return;
            }
            const user = yield users_repositories_1.UserRepository.findById(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            const userObject = user.toObject();
            const { password } = userObject, userResponse = __rest(userObject, ["password"]);
            res.status(200).json(userResponse);
        }
        catch (error) {
            res
                .status(500)
                .json({
                message: "Server error while fetching profile",
                error: error.message,
            });
        }
    });
}
/**
 * Sign in account with google
 * post /api/user/google
 */
// async function handleSuccessfulLogin(
//   user: IUserData,
//   res: Response,
//   message: string = "Login successful" // Add optional message parameter
// ) {
//   try {
//     const tokens = JWT.createTokens({
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     });
//     await redisClient.set(`refreshToken:${user.id}`, tokens.refreshToken, {
//       EX: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
//     });
//     res.cookie("refreshToken", tokens.refreshToken, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
//     });
//     const { password: _, ...userResponse } = user.toObject();
//     res.status(200).json({
//       message, // Use the message parameter here
//       accessToken: tokens.accessToken,
//       user: userResponse,
//     });
//   } catch (error) {
//     console.error("Error during handleSuccessfulLogin:", error);
//     res.status(500).json({ message: "Failed to create a session." });
//   }
// }
function handleSuccessfulLogin(user_1, res_1) {
    return __awaiter(this, arguments, void 0, function* (user, res, message = "Login successful") {
        try {
            // Always issue a new refresh token
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, config_1.config.jwtRefreshSecret, { expiresIn: `${REFRESH_TOKEN_EXPIRATION_SECONDS}s` });
            // Always issue a new access token
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, config_1.config.jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRATION });
            // Set the refresh token cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: REFRESH_TOKEN_EXPIRATION_SECONDS * 1000, // cookie expects ms
                path: "/",
            });
            const _a = user.toObject(), { password: _ } = _a, userResponse = __rest(_a, ["password"]);
            res.status(200).json({
                message,
                accessToken,
                user: userResponse,
            });
        }
        catch (error) {
            console.error("Error during handleSuccessfulLogin:", error);
            res.status(500).json({ message: "Failed to create a session." });
        }
    });
}
function googleAuthenicate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }
        try {
            // Verify the token with Google
            const ticket = yield client.verifyIdToken({
                idToken: token,
                audience: config_1.config.googleClientID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return res.status(400).json({ message: "Invalid Google token payload" });
            }
            let user = yield users_repositories_1.UserRepository.findByEmail(payload.email);
            if (user) {
                yield handleSuccessfulLogin(user, res);
            }
            else {
                const defaultPasswordForGoolgleLogin = (0, generateRandomNumber_1.generatePassword)();
                const hashedPassword = yield encription_1.Encryption.hashPassword(defaultPasswordForGoolgleLogin);
                const newUser = yield users_repositories_1.UserRepository.create({
                    name: payload.name,
                    email: payload.email,
                    password: hashedPassword,
                    profileUrl: payload.picture || "http://default.url/image.png",
                    role: "player", // Default role for new users
                    isVerified: true, // Google accounts are already verified
                    googleId: payload.sub, // Store Google's unique user ID
                }); // Log the newly created user in
                yield handleSuccessfulLogin(newUser, res);
            }
        }
        catch (error) {
            console.error("Google authentication error:", error);
            res.status(401).json({ message: "Invalid token or authentication failed" });
        }
    });
}
/* ----------------------- GET USER BY ID ----------------------- */
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ObjectId of the user
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
function getUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid user ID format.' });
            }
            const user = yield users_repositories_1.UserRepository.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            return res.status(200).json(user);
        }
        catch (error) {
            console.error('Error fetching user by ID:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    });
}
function searchUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query.q;
            const exclude = req.query.exclude;
            const excludeIds = exclude ? exclude.split(',') : [];
            if (!query) {
                res.status(400).json({ message: "A search query 'q' is required." });
                return;
            }
            const users = yield users_repositories_1.UserRepository.searchUsers(query, 10, excludeIds);
            res.status(200).json(users);
        }
        catch (error) {
            console.error("Error searching users:", error);
            res.status(500).json({ message: "An error occurred while searching for users." });
        }
    });
}
