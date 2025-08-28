"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = generateRandomNumber;
exports.getExpiryDate = getExpiryDate;
exports.generatePassword = generatePassword;
const crypto_1 = __importDefault(require("crypto"));
function generateRandomNumber(digits) {
    if (digits < 1) {
        throw new Error("Number of digits must be at least 1");
    }
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getExpiryDate(minutes) {
    const now = new Date();
    const expireUtc7 = new Date(now.getTime() + minutes * 60 * 1000 + 7 * 60 * 60 * 1000);
    return expireUtc7;
}
function generatePassword(length = 128) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`";
    let result = "";
    const randomValues = new Uint32Array(length);
    crypto_1.default.webcrypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
}
