"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCodeModel = void 0;
const mongoose_1 = require("mongoose");
const VerificationCodeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    Code: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
}, { collection: 'verificationcodes' });
exports.VerificationCodeModel = (0, mongoose_1.model)('VerificationCode', VerificationCodeSchema);
