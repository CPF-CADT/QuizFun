"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImageUpload = void 0;
const FileUpload_1 = require("../service/FileUpload");
const handleImageUpload = () => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Controller received request to upload an image.');
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided.' });
            }
            const imageBuffer = req.file.buffer;
            const uploadResult = yield (0, FileUpload_1.uploadImage)(imageBuffer);
            console.log('Image uploaded successfully to Cloudinary.');
            res.status(200).json({
                message: 'Image uploaded successfully!',
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            });
        }
        catch (error) {
            console.error('Failed to upload image.', error);
            res.status(500).json({ error: 'Failed to upload image. Please try again later.' });
        }
    });
};
exports.handleImageUpload = handleImageUpload;
