import { Request, Response, NextFunction } from 'express';
import { PaginationHelper } from '../service/pagination';

export interface PaginatedRequest extends Request {
  pagination?: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

/**
 * Middleware to validate and parse pagination parameters
 */
export function paginationMiddleware(validSortFields: string[] = ['createdAt']) {
  return (req: PaginatedRequest, res: Response, next: NextFunction) => {
    try {
      const params = PaginationHelper.validateParams(req.query);
      
      // Validate sortBy field
      const finalSortBy = params.sortBy && validSortFields.includes(params.sortBy) 
        ? params.sortBy 
        : validSortFields[0];

      req.pagination = {
        page: params.page,
        limit: params.limit,
        skip: PaginationHelper.getSkip(params.page, params.limit),
        search: params.search,
        sortBy: finalSortBy,
        sortOrder: params.sortOrder
      };

      next();
    } catch (error) {
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
export function customPaginationLimits(maxLimit: number = 100, defaultLimit: number = 10) {
  return (req: PaginatedRequest, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));

    req.pagination = {
      ...req.pagination,
      page,
      limit,
      skip: PaginationHelper.getSkip(page, limit)
    };

    next();
  };
}
