
import { Request, Response } from 'express';
import { uploadImage } from '../service/FileUpload';
import fs from 'fs';
/**
 * @swagger
 * tags:
 *   name: Service
 *   description: File upload to Cloudinary
 */

/**
 * @swagger
 * /api/service/upload:
 *   post:
 *     summary: Upload a file to Cloudinary
 *     tags: [Service]
 *     description: Uploads a single image or file to Cloudinary using simple upload (not chunked).
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
 *                 description: Image or file to upload
 *     responses:
 *       200:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Upload complete
 *                 url:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */

interface MulterRequest extends Request {
  file?: Express.Multer.File; 
}

export const handleImageUpload = async (req: MulterRequest, res: Response) => {
  console.log('Controller received request to upload an image.');

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }
    const imageBuffer = req.file.buffer;

    const uploadResult = await uploadImage(imageBuffer);

    console.log('Image uploaded successfully to Cloudinary.');
    res.status(200).json({
      message: 'Image uploaded successfully!',
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Failed to upload image.', error);
    res.status(500).json({ error: 'Failed to upload image. Please try again later.' });
  }
};
