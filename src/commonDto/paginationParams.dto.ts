import { IsOptional } from "class-validator";
import { Transform, Type } from "class-transformer";

function toNumber(value: any, defaultValue: number): number {
  if (isNaN(parseInt(value))) {
    return defaultValue;
  }
  return parseInt(value) ;
}

export class PaginationParams {
  // @Type(() => Number)
  // @Transform(({ value }) => toNumber(value, 1))
  @IsOptional()
  pageNumber: number;

  // @Type(() => Number)
  // @Transform(({ value }) => toNumber(value, 10))
  @IsOptional()
  pageSize: number;

  @IsOptional()
  sortBy: string;

  @IsOptional()
  sortDirection: string;
}