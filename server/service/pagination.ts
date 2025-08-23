export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export class PaginationHelper {
  
  /**
   * Validate and sanitize pagination parameters
   */
  static validateParams(query: any): PaginationParams {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
    const search = query.search as string;
    const sortBy = query.sortBy as string;
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

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
  static calculatePagination<T>(
    data: T[], 
    total: number, 
    page: number, 
    limit: number
  ): PaginationResult<T> {
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
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Generate MongoDB sort object
   */
  static getSortObject(sortBy: string, sortOrder: 'asc' | 'desc', validFields: string[]): any {
    const finalSortBy = validFields.includes(sortBy) ? sortBy : validFields[0];
    const sortObject: any = {};
    sortObject[finalSortBy] = sortOrder === 'asc' ? 1 : -1;
    return sortObject;
  }

  /**
   * Build search query for MongoDB
   */
  static buildSearchQuery(search: string, searchFields: string[]): any {
    if (!search) return {};
    
    return {
      $or: searchFields.map(field => ({
        [field]: { $regex: search, $options: 'i' }
      }))
    };
  }
}

export default PaginationHelper;
