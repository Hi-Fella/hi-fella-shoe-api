import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  total_pages: number;
}

export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
}

export class PaginationUtil {
  /**
   * Applies pagination to a TypeORM query builder and returns paginated results
   */
  static async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    params: PaginationParams = {},
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = options.defaultLimit || 20 } = params;
    const { maxLimit = 100 } = options;

    // Ensure limit is within bounds
    const finalLimit = Math.min(limit, maxLimit);
    const skip = (page - 1) * finalLimit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(finalLimit)
      .getManyAndCount();

    const total_pages = Math.ceil(total / finalLimit);

    return {
      data,
      total,
      page,
      total_pages,
    };
  }

  /**
   * Creates pagination metadata without executing the query
   */
  static createPaginationMeta(
    total: number,
    params: PaginationParams = {},
    options: PaginationOptions = {},
  ) {
    const { page = 1, limit = options.defaultLimit || 20 } = params;
    const { maxLimit = 100 } = options;

    const finalLimit = Math.min(limit, maxLimit);
    const total_pages = Math.ceil(total / finalLimit);

    return {
      total,
      page,
      total_pages,
    };
  }

  /**
   * Applies skip and take to a query builder (useful for custom pagination)
   */
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    params: PaginationParams = {},
    options: PaginationOptions = {},
  ): SelectQueryBuilder<T> {
    const { page = 1, limit = options.defaultLimit || 20 } = params;
    const { maxLimit = 100 } = options;

    const finalLimit = Math.min(limit, maxLimit);
    const skip = (page - 1) * finalLimit;

    return queryBuilder.skip(skip).take(finalLimit);
  }
}
