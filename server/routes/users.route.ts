import express from 'express'
import {register,login,updateUserInfo,sendVerificationCode,verifyEmail,refreshToken,logout} from '../controller/user.controller'
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';
import { validationBody } from '../middleware/validation.middleware';
import { userlogin, userRegister } from '../config/CheckValidation';


export const userRouter = express.Router();
userRouter.post('/register',validationBody(userRegister),register);
userRouter.post('/login',validationBody(userlogin),isEmailVerified );
userRouter.put('/:id',authenticateToken, updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyEmail);
userRouter.post('/refresh-token',refreshToken);
userRouter.post('/logout',logout);

 