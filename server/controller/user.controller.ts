import { Request, Response } from 'express';
import { Encryption } from '../service/encription';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository, User, TwoFaTokenRepository } from '../repositories/users.repositories';
import JWT from '../service/JWT';
import { generateRandomNumber, getExpiryDate } from '../service/generateRandomNumber';
import { sentEmail } from '../service/transporter';

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


export async function createUser(req: Request, res: Response): Promise<void> {
    const {
        name,
        email,
        profile_url,
        password,
        role
    }: {
        name: string;
        email: string;
        profile_url?: string;
        password: string;
        role: string
    } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ error: 'Missing required user information' });
        return;
    }

    try {
        // Check if user already exists
        const existingUser = await UserRepository.getUser(email);
        if (existingUser) {
            res.status(400).json({ error: 'email is already used' });
            return;
        }

        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: Encryption.hashPassword(password),
            profile_url: profile_url || 'http://default.url/image.png',
            role: role
        };

        await UserRepository.createUser(newUser);
        console.log('user create success')
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Error in createUser:", error);
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


export async function userLogin(req: Request, res: Response): Promise<void> {
    const { email, password }: { email: string; password: string } = req.body;

    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
    }

    try {
        const user = await UserRepository.getUser(email);

        if (!user) {
            res.status(400).json({ success: false, message: 'User not found' });
            return;
        }

        const isPasswordValid = Encryption.verifyPassword(user.password, password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: 'Incorrect password' });
            return;
        }

        const token = JWT.create({
            id: user.id,
            email: user.email,
            role: user.role,
            profile_url: user.profile_url
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profile_url: user.profile_url,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: (error as Error).message });
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
    const { name, email, password, profile_url } = req.body;

    if (!name && !email && !password && !profile_url) {
        res.status(400).json({ message: 'No update data provided' });
        return;
    }

    try {
        const newData: Partial<User> = {};

        if (name) newData.name = name;
        if (email) newData.email = email;
        if (profile_url) newData.profile_url = profile_url;
        if (password) newData.password = Encryption.hashPassword(password);

        const updatedUser = await UserRepository.updateData(id, newData);

        res.status(200).json({
            message: 'User update successful',
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
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
        const existingToken = await TwoFaTokenRepository.getToken(email);
        if (existingToken) {
            await TwoFaTokenRepository.deteteToken(email)
        }
        const code = generateRandomNumber(6)
        await TwoFaTokenRepository.addToken(email, code, getExpiryDate(15))
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
 *               - phone_number
 *               - code
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: "0123456789"
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



export async function verifyTwoFaCode(req: Request, res: Response): Promise<void> {
    const body: {
        email: string;
        code: number;
    } = req.body;
    const { email, code } = body;
    try {
        const userToken = await TwoFaTokenRepository.getToken(email);
        if (userToken) {
            const now = new Date();
            if (now < userToken.expires_at) {
                const success: boolean = code === userToken.code;
                console.log("Verification attempt:");
                console.log("Input Code:", code.toString());
                console.log("Stored Code:", userToken.code);
                console.log("Success:", success);
                if (success) {
                    await TwoFaTokenRepository.deteteToken(email);
                    // await CusomerRepository.markCustomerAsVerified(customer.customer_id);
                    const user = await UserRepository.getUser(email) as User;
                    const token = JWT.create({ id: user.id,role:user.role,email:user.email,profile_url:user.profile_url });
                    res.status(201).json({
                        success: true,
                        message: 'Verification successful and logged in',
                        token,
                    });
                    return;
                } else {
                    res.status(401).json({ message: 'verify code is incorrect' });
                    return;
                }
            } else {
                res.status(401).json({ message: 'verify code is already used' });
                return;
            }
        } else {
            res.status(401).json({ message: 'verify code is expired' });
            return;
        }
    } catch (err) {
        console.error("Error in verifyTwoFaCode:", err);
        res.status(500).json({ err: 'server fail ' + (err instanceof Error ? err.message : String(err)) });
        return;
    }
}