
import { Request, Response } from 'express';
import { uploadImage } from '../service/FileUpload';
import { FileUploadModel } from '../model/FileUpload';
import fs from 'fs';
/**
 * @swagger
 * /api/user/profile-detail:
 *   post:
 *     summary: Upload a user profile image
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 url: { type: string }
 *                 type: { type: string }
 *                 category:
 *                   type: string
 *                   enum: [user_profile]
 *                 public_id: { type: string }
 */

/**
 * @swagger
 * /api/quizz:
 *   post:
 *     summary: Upload a quiz image
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 url: { type: string }
 *                 type: { type: string }
 *                 category:
 *                   type: string
 *                   enum: [quizz_image]
 *                 public_id: { type: string }
 */


type UploadImage = 'user_ProfilePic' | 'quizz_Image' |'n/a';
interface MulterRequest extends Request {
  file?: Express.Multer.File; 
}

export const handleImageUpload = (category: UploadImage ='n/a') => { return async  (req: MulterRequest, res: Response) => {
  console.log('Controller received request to upload an image.');

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const imageBuffer = req.file.buffer;
    
    const uploadResult = await uploadImage(imageBuffer);

    console.log('Image uploaded successfully to Cloudinary.');
     const fileDocument = new FileUploadModel({
      title: req.file.originalname, 
      type: req.file.mimetype,
      category,
      url: uploadResult.secure_url,
    });

    await fileDocument.save();
    console.log('Image info saved to MongoDB.');
    res.status(200).json({
      message: 'Image uploaded successfully!',
      url: uploadResult.secure_url,
      type: req.file.mimetype,
      category,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Failed to upload image.', error);
    res.status(500).json({ error: 'Failed to upload image. Please try again later.' });
  }
}};
