// src/validations/game.schemas.ts

import Joi from 'joi';

// A reusable schema for validating MongoDB ObjectIds.
const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
});

export const gameSchemas = {
    // --- PARAMS Schemas ---

    // For routes with a single `:id` parameter like /session/:id
    idParam: {
        params: Joi.object({
            id: mongoId.required()
        })
    },

    // For routes with a single `:sessionId` parameter
    sessionIdParam: {
        params: Joi.object({
            sessionId: mongoId.required()
        })
    },
    
    // For the user performance route: /session/:sessionId/performance/:userId
    userPerformanceParams: {
        params: Joi.object({
            sessionId: mongoId.required(),
            userId: mongoId.required()
        })
    },

    // --- QUERY Schemas ---

    // For GET /session
    getSessions: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10)
        })
    },
    
    // For GET /session/:sessionId/results
    getSessionResults: {
        query: Joi.object({
            userId: mongoId.optional(),
            guestName: Joi.string().trim().max(50).optional()
        }).or('userId', 'guestName').messages({ // Ensures at least one of the keys is present
            'object.missing': 'A userId or guestName query parameter is required.'
        })
    },
    
    // For GET /session/:sessionId/performance/guest
    getGuestPerformance: {
        query: Joi.object({
            name: Joi.string().trim().min(1).max(50).required()
        })
    },

    // --- BODY Schemas ---

    // For POST /session/:sessionId/feedback
    addFeedback: {
        body: Joi.object({
            rating: Joi.number().min(1).max(5).required(),
            comment: Joi.string().trim().max(500).allow('').optional()
        })
    }
};