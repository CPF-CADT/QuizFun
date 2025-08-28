"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHelper = void 0;
class PaginationHelper {
    /**
     * Validate and sanitize pagination parameters
     */
    static validateParams(query) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
        const search = query.search;
        const sortBy = query.sortBy;
        const sortOrder = query.sortOrder || 'desc';
        return {
            page,
            limit,
            search,
            sortBy,
            sortOrder
        };
    }
    /**
     * Calculate pagination metadata
     */
    static calculatePagination(data, total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            limit
        };
    }
    /**
     * Generate MongoDB skip value
     */
    static getSkip(page, limit) {
        return (page - 1) * limit;
    }
    /**
     * Generate MongoDB sort object
     */
    static getSortObject(sortBy, sortOrder, validFields) {
        const finalSortBy = validFields.includes(sortBy) ? sortBy : validFields[0];
        const sortObject = {};
        sortObject[finalSortBy] = sortOrder === 'asc' ? 1 : -1;
        return sortObject;
    }
    /**
     * Build search query for MongoDB
     */
    static buildSearchQuery(search, searchFields) {
        if (!search)
            return {};
        return {
            $or: searchFields.map(field => ({
                [field]: { $regex: search, $options: 'i' }
            }))
        };
    }
}
exports.PaginationHelper = PaginationHelper;
exports.default = PaginationHelper;
