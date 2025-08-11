import express from 'express'
import {register,login,updateUserInfo,sendVerificationCode,verifyEmail,refreshToken,logout} from '../controller/user.controller'
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';
import { validationBody } from '../middleware/validation.middleware';


export const userRouter = express.Router();
userRouter.post('/register',register);
userRouter.post('/login',isEmailVerified, login,validationBody);
userRouter.put('/:id',authenticateToken, updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyEmail);
userRouter.post('/refresh-token',refreshToken);
userRouter.post('/logout',logout);

 