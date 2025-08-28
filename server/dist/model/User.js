"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: false, select: false },
    role: { type: String, enum: ['player', 'admin'], default: 'player' },
    profileUrl: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
}, { timestamps: true,
    collection: 'users'
});
//index for role
UserSchema.index({ role: 1 });
//index for name
UserSchema.index({ name: 1 });
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
