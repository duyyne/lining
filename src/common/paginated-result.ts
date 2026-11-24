import { PaginationQueryDto } from './dto/pagination-query.dto';

export function paginatedResult<T>(
  items: T[],
  total: number,
  query: PaginationQueryDto,
) {
  return {
    items,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
