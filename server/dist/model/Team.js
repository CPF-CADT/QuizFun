"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModel = void 0;
const mongoose_1 = require("mongoose");
const TeamMemberSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
}, { _id: false });
const TeamSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    inviteCode: { type: String, required: true, unique: true, index: true },
    members: { type: [TeamMemberSchema], default: [] },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, collection: 'teams' });
exports.TeamModel = (0, mongoose_1.model)('Team', TeamSchema);
