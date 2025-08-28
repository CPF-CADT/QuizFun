"use strict";
// src/validations/game.schemas.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
// A reusable schema for validating MongoDB ObjectIds.
const mongoId = joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
});
exports.gameSchemas = {
    // --- PARAMS Schemas ---
    // For routes with a single `:id` parameter like /session/:id
    idParam: {
        params: joi_1.default.object({
            id: mongoId.required()
        })
    },
    // For routes with a single `:sessionId` parameter
    sessionIdParam: {
        params: joi_1.default.object({
            sessionId: mongoId.required()
        })
    },
    // For the user performance route: /session/:sessionId/performance/:userId
    userPerformanceParams: {
        params: joi_1.default.object({
            sessionId: mongoId.required(),
            userId: mongoId.required()
        })
    },
    // --- QUERY Schemas ---
    // For GET /session
    getSessions: {
        query: joi_1.default.object({
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(100).default(10)
        })
    },
    // For GET /session/:sessionId/results
    getSessionResults: {
        query: joi_1.default.object({
            userId: mongoId.optional(),
            guestName: joi_1.default.string().trim().max(50).optional()
        }).or('userId', 'guestName').messages({
            'object.missing': 'A userId or guestName query parameter is required.'
        })
    },
    // For GET /session/:sessionId/performance/guest
    getGuestPerformance: {
        query: joi_1.default.object({
            name: joi_1.default.string().trim().min(1).max(50).required()
        })
    },
    // --- BODY Schemas ---
    // For POST /session/:sessionId/feedback
    addFeedback: {
        body: joi_1.default.object({
            rating: joi_1.default.number().min(1).max(5).required(),
            comment: joi_1.default.string().trim().max(500).allow('').optional()
        })
    }
};
