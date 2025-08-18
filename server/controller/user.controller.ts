import { Request, Response } from 'express';
import { Encryption } from '../service/encription';
import { UserRepository, UserData } from '../repositories/users.repositories';
import { JWT } from '../service/JWT';
import { generateRandomNumber, getExpiryDate } from '../service/generateRandomNumber';
import { sentEmail } from '../service/transporter';
import { VerificationCodeRepository } from '../repositories/verification.repositories';
import { IUserData, UserModel } from '../model/User';
import jwt from "jsonwebtoken";
import redisClient from '../config/redis';

const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_COOKIE_EXPIRATION_MS = REFRESH_TOKEN_EXPIRATION_SECONDS * 1000;


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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of users per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: A list of users with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = req.query.search as string;

  try {
    const result = await UserRepository.getAllUsers(page, limit, search);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

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
 *         description: User role to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of users per page (max 100)
 *     responses:
 *       200:
 *         description: A list of users with specified role and pagination info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       400:
 *         description: Invalid role or query parameters
 *       500:
 *         description: Internal server error
 */
export async function getUsersByRole(req: Request, res: Response): Promise<void> {
  const { role } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

  const validRoles = ['player', 'admin', 'moderator'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ message: 'Invalid role. Must be one of: player, admin, moderator' });
    return;
  }

  try {
    const result = await UserRepository.getUsersByRole(role, page, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users by role',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 example: player
 *               profile_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request – Missing fields or user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Internal server error
 */

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, profile_url, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Missing required user information' });
    return;
  }

  const existingUser = await UserRepository.findByEmail(email);
  if (existingUser) {
    res.status(409).json({ error: 'Email is already used' }); // Use 409 Conflict for existing resources
    return;
  }



  const createdUser = await UserRepository.create({
    name,
    email,
    password: Encryption.hashPassword(password),
    profileUrl: profile_url || 'http://default.url/image.png',
    role: role || 'player',
    isVerified: false,
  } as IUserData);

  // --- Automatically send verification email ---
  const code = generateRandomNumber(6);
  await VerificationCodeRepository.create(createdUser.id, code, getExpiryDate(15)); // Expires in 15 mins

  const subject = 'Verify Your Email Address';
  const htmlContent = `<p>Welcome! Your verification code is: <strong>${code}</strong></p>`;
  await sentEmail(email, subject, '', htmlContent);

  res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
}

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
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found or password incorrect
 *       500:
 *         description: Internal server error
 */

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!user.isVerified) {
    res.status(403).json({ message: "Account not verified. Please check your email." });
    return;
  }

  const isPasswordValid = Encryption.verifyPassword(user.password as string, password);
  if (!isPasswordValid) {
    res.status(401).json({ message: "Incorrect password" });
    return;
  }

  const tokens = JWT.createTokens({ id: user.id, email: user.email, role: user.role });

  try {
    await redisClient.set(`refreshToken:${user.id}`, tokens.refreshToken, {
      EX: REFRESH_TOKEN_EXPIRATION_SECONDS
    });
  } catch (redisError) {
    console.error("Redis Error on Login:", redisError);
    res.status(500).json({ message: "Failed to create session" });
    return;
  }

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
  });

  const { password: _, ...userResponse } = user.toObject();

  res.status(200).json({
    message: "Login successful",
    accessToken: tokens.accessToken,
    user: userResponse,
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


export async function updateUserInfo(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, password, profileUrl } = req.body;

  if (!name && !password && !profileUrl) {
    res.status(400).json({ message: 'No update data provided' });
    return;
  }

  const dataToUpdate: Partial<UserData> = {};

  if (name) dataToUpdate.name = name;
  if (profileUrl) dataToUpdate.profileUrl = profileUrl;

  // Only hash and add the password if a new one was provided
  if (password) {
    dataToUpdate.password = Encryption.hashPassword(password);
  }

  const updatedUser = await UserRepository.update(id, dataToUpdate);

  if (!updatedUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const { password: _, ...userResponse } = updatedUser.toObject();

  res.status(200).json({
    message: 'User updated successfully',
    user: userResponse,
  });

}

/**
 * @swagger
 * /api/user/request-code:
 *   post:
 *     summary: Send a 4-digit verification code to a user's phone number
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone_number
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "0123456789"
 *     responses:
 *       201:
 *         description: Verification code created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: verify code is create successful
 *       404:
 *         description: Phone number not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: phone number does not exixts
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


export async function sendVerificationCode(req: Request, res: Response): Promise<void> {
  const body: {
    email: string;
  } = req.body;
  const { email } = body;
  const userTemp = await UserRepository.findByEmail(email)
  try {
    await VerificationCodeRepository.delete(userTemp?.id)
  } catch (err) {
    console.error('Error when sent 2FA')
  }
  const code = generateRandomNumber(6)
  await VerificationCodeRepository.create(email, code, getExpiryDate(5))
  const subject = 'Email Verification Code';
  const text = `Your verification code is: ${code}`;
  const htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
  await sentEmail(email, subject, text, htmlContent);
  res.status(201).json({ message: 'Verification code sent successfully!' });
  return;
}


/**
 * @swagger
 * /api/user/verify-otp:
 *   post:
 *     summary: Verify the 4-digit two-factor authentication code
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
 *                 example: "vathanak@gmail.com"
 *               code:
 *                 type: integer
 *                 example: 1234
 *     responses:
 *       201:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: verify code successful
 *       401:
 *         description: Invalid, expired, or already-used code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: verify code is expired
 *       404:
 *         description: Phone number not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: phone number does not exixts
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

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({ message: "Email and code are required." });
    return;
  }

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    res.status(400).json({ message: "Invalid verification code or email." });
    return;
  }

  const verificationToken = await VerificationCodeRepository.find(user.id.toString(), code);
  if (!verificationToken) {
    res.status(400).json({ message: "Invalid or expired verification code." });
    return;
  }

  await UserRepository.update(user.id.toString(), { isVerified: true });
  await VerificationCodeRepository.delete(verificationToken.id);

  const tokens = JWT.createTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  try {
    await redisClient.set(`refreshToken:${user.id}`, tokens.refreshToken, {
      EX: REFRESH_TOKEN_EXPIRATION_SECONDS,
    });
  } catch (err) {
    console.error("Redis Error:", err);
    res.status(500).json({ message: "Failed to store session." });
    return;
  }

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
  });

  const { password, ...userResponse } = user.toObject();

  res.status(200).json({
    message: "Email verified successfully. You are now logged in.",
    accessToken: tokens.accessToken,
    user: userResponse,
  });
}

/**
 * @swagger
 * /api/user/refresh-token:
 *   post:
 *     summary: Generate a new access token using the refresh token in HTTP-only cookie
 *     tags: [User]
 *     description: >
 *       Uses the refresh token stored in the client's HTTP-only cookie to issue a new short-lived access token.
 *       The refresh token must be valid and not expired.  
 *       No request body is required, but the cookie must be sent.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: New access token issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Refresh token invalid or expired
 *       500:
 *         description: Server error
 */


export async function refreshToken(req: Request, res: Response): Promise<void> {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  let decodedUser;
  try {
    decodedUser = JWT.verifyRefreshToken(oldRefreshToken) as { id: string; email?: string; role: string; };
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
    return;
  }

  try {
    const storedToken = await redisClient.get(`refreshToken:${decodedUser.id}`);

    if (!storedToken || storedToken !== oldRefreshToken) {
      await redisClient.del(`refreshToken:${decodedUser.id}`);
      res.status(403).json({ message: "Session invalid. Please log in again." });
      return
    }

    const newTokens = JWT.createTokens({
      id: decodedUser.id,
      email: decodedUser.email,
      role: decodedUser.role
    });

    await redisClient.set(`refreshToken:${decodedUser.id}`, newTokens.refreshToken, {
      EX: REFRESH_TOKEN_EXPIRATION_SECONDS
    });

    res.cookie("refreshToken", newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRATION_MS,
    });

    // Send the NEW access token.
    res.json({ accessToken: newTokens.accessToken });

  } catch (err) {
    console.error("Error during token refresh:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout the user by clearing the refresh token cookie
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
  const refreshToken = req.cookies.refreshToken;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  if (!refreshToken) {
    res.status(400).json({ message: "No refresh token provided" });
    return
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string };

    const result = await redisClient.del(`refreshToken:${decoded.id}`);

    if (result === 0) {
      res.status(400).json({ message: "Already logged out or invalid token" });
      return
    }

    res.clearCookie("refreshToken", cookieOptions);
    res.status(200).json({ message: "Logout successful" });
    return

  } catch (err) {
    console.error("Error during logout:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return
  }
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

  const verification = await VerificationCodeRepository.find(user.id.toString(), code);
  if (!verification) return res.status(400).json({ message: "Invalid or expired code." });

  await VerificationCodeRepository.delete(verification.id);

  const resetToken = jwt.sign(
    { id: user.id, type: "password_reset" },
    process.env.JWT_SECRET_RESET_PASSWORD!,
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
    res.status(401).json({ message: "Password and confirm password must be the same." });
    return;
  }

  try {
    const payload = jwt.verify(resetToken, process.env.JWT_SECRET_RESET_PASSWORD!) as { id: string; type: string };
    if (payload.type !== "password_reset") {
      res.status(400).json({ message: "Invalid token type" });
      return;
    }

    const hashedPassword = Encryption.hashPassword(newPassword);
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
      res.status(401).json({ message: "Unauthorized: No user ID found in token" });
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
    res.status(500).json({ message: "Server error while fetching profile", error: (error as Error).message });
  }
}
