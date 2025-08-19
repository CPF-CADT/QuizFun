import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';
import { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
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