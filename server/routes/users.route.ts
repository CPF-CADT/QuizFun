import express from 'express'
import {register,login,updateUserInfo,sendVerificationCode,verifyEmail,refreshToken,logout,getAllUsers,getUsersByRole} from '../controller/user.controller'
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';
// import { validationBody } from '../middleware/validation.middleware';
// import { userlogin, userRegister } from '../config/CheckValidation';


export const userRouter = express.Router();

// User management routes with pagination
userRouter.get('/', authenticateToken, getAllUsers); // GET all users with pagination
userRouter.get('/by-role/:role', authenticateToken, getUsersByRole); // GET users by role with pagination

// Authentication routes
userRouter.post('/register',register);
userRouter.post('/login',isEmailVerified, login);
userRouter.put('/:id',authenticateToken, updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyEmail);
userRouter.post('/refresh-token',refreshToken);
userRouter.post('/logout',logout);

 