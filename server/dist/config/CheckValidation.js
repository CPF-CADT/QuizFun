"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzCreate = exports.userlogin = exports.userRegister = void 0;
const joi_1 = __importDefault(require("joi"));
//user
exports.userRegister = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    profileUrl: joi_1.default.string()
});
exports.userlogin = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
//quizz
exports.quizzCreate = joi_1.default.object({
    title: joi_1.default.string().min(2).max(100).required(),
    description: joi_1.default.string().max(1000),
});
