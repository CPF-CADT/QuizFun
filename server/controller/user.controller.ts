import { Request, Response } from 'express';
import { Encryption } from '../service/encription';
import { UserRepository, UserData } from '../repositories/users.repositories';
import JWT from '../service/JWT';
import { generateRandomNumber, getExpiryDate } from '../service/generateRandomNumber';
import { sentEmail } from '../service/transporter';
import { VerificationCodeRepository } from '../repositories/verification.repositories';
import { UserModel } from '../model/User';
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Management
 */

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
 */


export async function register(req: Request, res: Response): Promise<void> {
    const { name, email, password, profile_url, role } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: 'Missing required user information' });
        return;
    }

    try {
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            res.status(409).json({ error: 'Email is already used' }); // Use 409 Conflict for existing resources
            return;
        }

        const newUserDoc = new UserModel({
            name,
            email,
            password: Encryption.hashPassword(password),
            profileUrl: profile_url || 'http://default.url/image.png',
            role: role || 'player',
            isVerified: false,
        });

        const createdUser = await UserRepository.create(newUserDoc);

        // --- Automatically send verification email ---
        const code = generateRandomNumber(6);
        await VerificationCodeRepository.create(createdUser.id, code, getExpiryDate(15)); // Expires in 15 mins

        const subject = 'Verify Your Email Address';
        const htmlContent = `<p>Welcome! Your verification code is: <strong>${code}</strong></p>`;
        await sentEmail(email, subject, '', htmlContent);

        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ error: 'User creation failed' });
    }
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

    try {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // CRITICAL CHANGE: Check if the user's email is verified
        if (!user.isVerified) {
            res.status(403).json({ message: 'Account not verified. Please check your email.' });
            return;
        }

        const isPasswordValid = Encryption.verifyPassword(user.password as string, password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Incorrect password' });
            return;
        }

        const token = JWT.create({ id: user.id, email: user.email, role: user.role });
        const { password: _, ...userResponse } = user; // Exclude password from response

        res.status(200).json({ message: 'Login successful', token, user: userResponse });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
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

    try {
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

        // Ensure the password hash is not sent back in the response
        const { password: _, ...userResponse } = updatedUser.toObject();

        res.status(200).json({
            message: 'User updated successfully',
            user: userResponse,
        });
    } catch (err) {
        console.error("Error in updateUserInfo:", err);
        res.status(500).json({ message: "An internal server error occurred." });
    }
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
    try {
        const userTemp = await UserRepository.findByEmail(email)
        try{
            await VerificationCodeRepository.delete(userTemp?.id)
        }catch(err){
            console.error('Error when sent 2FA')
        }
        const code = generateRandomNumber(6)
        await VerificationCodeRepository.create(email, code, getExpiryDate(15))
        const subject = 'Email Verification Code';
        const text = `Your verification code is: ${code}`;
        const htmlContent = `<p>Your verification code is: <strong>${code}</strong></p>`;
        await sentEmail(email, subject, text, htmlContent);
        res.status(201).json({ message: 'Verification code sent successfully!' });
        return;
    } catch (err) {
        console.error("Error in sendVerificationCode:", err);
        res.status(500).json({ err: 'Server failed to process verification code request: ' + (err instanceof Error ? err.message : String(err)) });
        return;
    }
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

    try {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            res.status(400).json({ message: 'Invalid verification code or email.' });
            return
        }
 
        const verificationToken = await VerificationCodeRepository.find(user._id.toString(), code);

        if (!verificationToken) {
            res.status(400).json({ message: 'Invalid or expired verification code.' });
            return
        }

        await UserRepository.update(user._id.toString(), { isVerified: true });

        await VerificationCodeRepository.delete(verificationToken.id);

        const token = JWT.create({ id: user.id, email: user.email, role: user.role });
        const { password: _, ...userResponse } = user.toObject(); 

        res.status(200).json({ message: 'Email verified successfully. You are now logged in.', token });
        
    } catch (err) {
        console.error("Error in verifyEmail:", err);
        res.status(500).json({ error: 'Server failed to verify email.' });
    }
}