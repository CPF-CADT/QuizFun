"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugReport = void 0;
const mongoose_1 = require("mongoose");
const bugReportSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true }, // 1-5 rating
    createdAt: { type: Date, default: Date.now },
});
exports.BugReport = (0, mongoose_1.model)('BugReport', bugReportSchema);
