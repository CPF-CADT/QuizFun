import express from 'express'
import {createUser,userLogin,updateUserInfo,sendVerificationCode,verifyTwoFaCode} from '../controller/user.controller'
import { authenticateToken } from '../middleware/authenicate.middleware';
export const userRouter = express.Router();
userRouter.post('/register',createUser);
userRouter.post('/login',userLogin);
userRouter.put('/:id',authenticateToken,updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyTwoFaCode);
 