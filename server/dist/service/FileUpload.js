"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config/config");
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinaryCloudName,
    api_key: config_1.config.cloudinaryApiKey,
    api_secret: config_1.config.cloudinaryApiSecret,
});
const uploadImage = (fileBuffer, tags = ['nodejs-sample']) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ tags: tags }, (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(error);
            }
            if (result) {
                resolve(result);
            }
            else {
                reject(new Error('Cloudinary upload resulted in an undefined result.'));
            }
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadImage = uploadImage;
