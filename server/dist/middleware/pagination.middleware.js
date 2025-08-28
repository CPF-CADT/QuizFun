"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationMiddleware = paginationMiddleware;
exports.customPaginationLimits = customPaginationLimits;
const pagination_1 = require("../service/pagination");
/**
 * Middleware to validate and parse pagination parameters
 */
function paginationMiddleware(validSortFields = ['createdAt']) {
    return (req, res, next) => {
        try {
            const params = pagination_1.PaginationHelper.validateParams(req.query);
            // Validate sortBy field
            const finalSortBy = params.sortBy && validSortFields.includes(params.sortBy)
                ? params.sortBy
                : validSortFields[0];
            req.pagination = {
                page: params.page,
                limit: params.limit,
                skip: pagination_1.PaginationHelper.getSkip(params.page, params.limit),
                search: params.search,
                sortBy: finalSortBy,
                sortOrder: params.sortOrder
            };
            next();
        }
        catch (error) {
            res.status(400).json({
                message: 'Invalid pagination parameters',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
/**
 * Middleware to validate specific pagination limits for different endpoints
 */
function customPaginationLimits(maxLimit = 100, defaultLimit = 10) {
    return (req, res, next) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
        req.pagination = Object.assign(Object.assign({}, req.pagination), { page,
            limit, skip: pagination_1.PaginationHelper.getSkip(page, limit) });
        next();
    };
}
