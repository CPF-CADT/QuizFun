import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (
  fileBuffer: Buffer,
  tags: string[] = ['nodejs-sample']
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { tags: tags },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Cloudinary upload resulted in an undefined result.'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};