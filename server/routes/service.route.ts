import express from 'express'
import {handleImageUpload} from '../controller/service.controller'
import multer from 'multer';
export const serviceRouter = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage });
serviceRouter.post('/upload', upload.single('image'), handleImageUpload);
