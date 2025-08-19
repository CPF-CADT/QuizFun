import express from 'express'
import {register,login,updateUserInfo,sendVerificationCode,verifyCode,refreshToken,logout,getAllUsers,getUsersByRole, getProfile, googleAuthenicate} from '../controller/user.controller'
import { authenticateToken, isEmailVerified } from '../middleware/authenicate.middleware';
import { validationBody } from '../middleware/validation.middleware';
import { userlogin, userRegister } from '../config/CheckValidation';
import { handleImageUpload } from '../controller/service.controller';
import multer from 'multer';


export const userRouter = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

// User management routes with pagination
userRouter.get('/', authenticateToken, getAllUsers); // GET all users with pagination
userRouter.get('/by-role/:role', authenticateToken, getUsersByRole); // GET users by role with pagination
// Authentication routes
userRouter.get('/profile', authenticateToken, getProfile);
userRouter.post('/google', googleAuthenicate);
userRouter.post('/register',validationBody(userRegister),register);
userRouter.post('/login',validationBody(userlogin),isEmailVerified, login);
userRouter.put('/:id',authenticateToken, updateUserInfo)
userRouter.post('/request-otp',sendVerificationCode);
userRouter.post('/verify-otp',verifyCode);
userRouter.post('/refresh-token',refreshToken);
userRouter.post('/logout',logout);
userRouter.post('/profile-detail',upload.single('image'),handleImageUpload('user_ProfilePic'));
 
