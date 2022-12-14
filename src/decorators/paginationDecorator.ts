import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { PaginationParams } from "../commonDto/paginationParams.dto";

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const query = ctx.switchToHttp().getRequest().query;

    let sortBy = query.sortBy as string || 'createdAt';
    let sortDirection = query.sortDirection as string || '';
    let pageNumber = parseInt(query.pageNumber);
    let pageSize = parseInt(query.pageSize);

    sortBy = sortBy.trim();

    sortDirection = sortDirection.toLowerCase().trim();
    if (!["asc", "desc"].includes(sortDirection)) {
      sortDirection = "desc";
    }

    pageNumber = isNaN(pageNumber) ? 1 : pageNumber;
    pageSize = isNaN(pageSize) ? 10 : pageSize;

    const paginationParams: PaginationParams = {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    };

    return paginationParams;
  }
);