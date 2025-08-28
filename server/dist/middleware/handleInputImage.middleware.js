"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageType = validateImageType;
exports.validateImage = validateImage;
function validateImageType(req, res, next) {
    let { category } = req.body;
    if (!category) {
        return res.status(400).json({ message: 'can not catch category' });
    }
    if (category !== 'quizz_image' && category !== 'user_profilePic') {
        category = 'N/A';
    }
    req.body.category = category;
    next();
}
function validateImage(req, res, next) {
    let { type, url } = req.body;
    if (!type) {
        return res.status(400).json({ message: 'can not catch type' });
    }
    const checkimage = /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
    if (!checkimage) {
        return res.status(400).json({ message: 'no input file' });
    }
    ;
    // if(!req.file.mimetype.startsWith('image/')){return res.status(400).json({message:'input file have to be image'})};
    next();
}
