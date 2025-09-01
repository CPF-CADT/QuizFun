import { Request, Response } from "express";
import { Encryption } from "../service/encription";
import { UserRepository, UserData } from "../repositories/users.repositories";
import { JWT } from "../service/JWT";
import {
  generatePassword,
  generateRandomNumber,
  getExpiryDate,
} from "../service/generateRandomNumber";
import { sentEmail } from "../service/transporter";
import { VerificationCodeRepository } from "../repositories/verification.repositories";
import { IUserData, UserModel } from "../model/User";
import jwt from "jsonwebtoken";
// import redisClient from "../config/redis";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config/config";
import { Types } from 'mongoose';

const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRATION = "15m";
const client = new OAuth2Client(config.googleClientID);

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
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const search = req.query.search as string;

  try {
    const result = await UserRepository.getAllUsers(page, limit, search);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
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
export async function getUsersByRole(
  req: Request,
  res: Response
): Promise<void> {
  const { role } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );

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
    const result = await UserRepository.getUsersByRole(role, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users by role",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
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
export async function register(req: Request, res: Response): Promise<Response> {
  const { name, email, password, profile_url, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required user information' });
  }
  let createdUser;
  const hashedPassword = await Encryption.hashPassword(password);
  try {
    createdUser = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      profileUrl: profile_url || 'http://default.url/image.png',
      role: role || 'player',
      isVerified: false,
    } as IUserData);
  } catch (err) {
    return res.status(409).json({ error: 'Email is already used' }); // Use 409 Conflict for existing resources
  }
  const code = generateRandomNumber(6);
  const subject = 'Verify Your Email Address';
  const htmlContent = `<p>Welcome! Your verification code is: <strong>${code}</strong></p>`;
  await Promise.all([
    VerificationCodeRepository.create(createdUser.id, code, getExpiryDate(15)),
    sentEmail(email, subject, '', htmlContent)
  ]);
  return res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
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

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await UserRepository.findByEmail(email);
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

  const isPasswordValid = await Encryption.verifyPassword(
    user.password as string,
    password
  );
  if (!isPasswordValid) {
    res.status(401).json({ message: "Incorrect password" });
    return;
  }

  await handleSuccessfulLogin(user, res);
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

export async function updateUserInfo(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const { name, password, profileUrl } = req.body;

  if (!name && !password && !profileUrl) {
    res.status(400).json({ message: "No update data provided" });
    return;
  }

  const dataToUpdate: Partial<UserData> = {};

  if (name) dataToUpdate.name = name;
  if (profileUrl) dataToUpdate.profileUrl = profileUrl;

  // Only hash and add the password if a new one was provided
  if (password) {
    dataToUpdate.password = await Encryption.hashPassword(password);
  }

  const updatedUser = await UserRepository.update(id, dataToUpdate);

  if (!updatedUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const { password: _, ...userResponse } = updatedUser.toObject();

  res.status(200).json({
    message: "User updated successfully",
    user: userResponse,
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

export async function sendVerificationCode(
  req: Request,
  res: Response
): Promise<void> {
  const body: {
    email: string;
  } = req.body;
  const { email } = body;
  const userTemp = await UserRepository.findByEmail(email);
  if (!userTemp) {
    res.status(404).json({ message: "Email not register yet!" });
    return;
  }
  try {
    await VerificationCodeRepository.delete(userTemp.id);
  } catch (err) {
    console.error("Error when sent 2FA");
  }
  const code = generateRandomNumber(6);
  await VerificationCodeRepository.create(email, code, getExpiryDate(5));
  const subject = "Email Verification Code";
  const text = `Your verification code is: ${code}`;
  const htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
  await sentEmail(email, subject, text, htmlContent);
  res.status(201).json({ message: "Verification code sent successfully!" });
  return;
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
export async function verifyCode(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ message: "Email and code are required." });
    return;
  }

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const verificationToken = await VerificationCodeRepository.find(
    user.id.toString(),
    code
  );
  if (!verificationToken) {
    res.status(401).json({ message: "Invalid or expired code." });
    return;
  }

  await UserRepository.update(user.id.toString(), { isVerified: true });
  await VerificationCodeRepository.delete(verificationToken.id);

  const successMessage = "Verification successful. You are now logged in.";
  await handleSuccessfulLogin(user, res, successMessage);
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
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtRefreshSecret!) as {
      id: string;
      email?: string;
      role: string;
    };
  } catch (err) {
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
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      config.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error during token refresh" });
  }
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

export async function logout(req: Request, res: Response): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
  };

  // Clear refresh token cookie
  res.clearCookie("refreshToken", cookieOptions);

  // No Redis cleanup needed since we don’t store refresh tokens
  res.status(200).json({ message: "Logout successful" });
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
export async function verifyPasswordResetCode(req: Request, res: Response) {
  const { email, code } = req.body;
  const user = await UserRepository.findByEmail(email);
  if (!user) return res.status(400).json({ message: "Invalid email or code." });

  const verification = await VerificationCodeRepository.find(
    user.id.toString(),
    code
  );
  if (!verification)
    return res.status(400).json({ message: "Invalid or expired code." });

  await VerificationCodeRepository.delete(verification.id);

  const resetToken = jwt.sign(
    { id: user.id, type: "password_reset" },
    config.jwtSecretResetPassword!,
    { expiresIn: "10m" }
  );

  res.status(200).json({ message: "Code verified", resetToken });
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
export async function resetPassword(req: Request, res: Response) {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    res
      .status(401)
      .json({ message: "Password and confirm password must be the same." });
    return;
  }

  try {
    const payload = jwt.verify(resetToken, config.jwtSecretResetPassword!) as {
      id: string;
      type: string;
    };
    if (payload.type !== "password_reset") {
      res.status(400).json({ message: "Invalid token type" });
      return;
    }

    const hashedPassword = await Encryption.hashPassword(newPassword);
    await UserRepository.update(payload.id, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
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

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(401)
        .json({ message: "Unauthorized: No user ID found in token" });
      return;
    }
    const user = await UserRepository.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const userObject = user.toObject();
    const { password, ...userResponse } = userObject;
    res.status(200).json(userResponse);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while fetching profile",
        error: (error as Error).message,
      });
  }
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
async function handleSuccessfulLogin(
  user: IUserData,
  res: Response,
  message: string = "Login successful"
) {
  try {
    // Always issue a new refresh token
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtRefreshSecret,
      { expiresIn: `${REFRESH_TOKEN_EXPIRATION_SECONDS}s` }
    );

    // Always issue a new access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    // Set the refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_EXPIRATION_SECONDS * 1000, // cookie expects ms
      path: "/",
    });

    const { password: _, ...userResponse } = user.toObject();

    res.status(200).json({
      message,
      accessToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during handleSuccessfulLogin:", error);
    res.status(500).json({ message: "Failed to create a session." });
  }
}

export async function googleAuthenicate(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.googleClientID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }
    let user = await UserRepository.findByEmail(payload.email);

    if (user) {
      await handleSuccessfulLogin(user, res);
    } else {
      const defaultPasswordForGoolgleLogin = generatePassword();
      const hashedPassword = await Encryption.hashPassword(defaultPasswordForGoolgleLogin);

      const newUser = await UserRepository.create({
        name: payload.name!,
        email: payload.email,
        password: hashedPassword,
        profileUrl: payload.picture || "http://default.url/image.png",
        role: "player", // Default role for new users
        isVerified: true, // Google accounts are already verified
        googleId: payload.sub, // Store Google's unique user ID
      } as IUserData); // Log the newly created user in

      await handleSuccessfulLogin(newUser, res);
    }
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(401).json({ message: "Invalid token or authentication failed" });
  }
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
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;


    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }


    const user = await UserRepository.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function searchUsers(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query.q as string;
            const exclude = req.query.exclude as string | undefined;
            const excludeIds = exclude ? exclude.split(',') : [];

            if (!query) {
                res.status(400).json({ message: "A search query 'q' is required." });
                return;
            }

            const users = await UserRepository.searchUsers(query, 10, excludeIds);
            res.status(200).json(users);

        } catch (error) {
            console.error("Error searching users:", error);
            res.status(500).json({ message: "An error occurred while searching for users." });
        }
    }
