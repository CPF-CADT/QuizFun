"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("../controller/service.controller");
const multer_1 = __importDefault(require("multer"));
const serviceRouter = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
serviceRouter.post('/upload', upload.single('image'), (0, service_controller_1.handleImageUpload)());
exports.default = serviceRouter;
