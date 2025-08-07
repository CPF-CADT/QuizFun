import express from 'express'
import {register,login,updateUserInfo,sendVerificationCode,verifyEmail} from '../controller/user.controller'
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';
export const userRouter = express.Router();
userRouter.post('/register',register);
userRouter.post('/login',isEmailVerified, login);
userRouter.put('/:id',authenticateToken, updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyEmail);
 