import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) || num <= 0 ? 1 : num;
  })
  page?: number = 1;

  @IsOptional()
  @Max(50)
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) || num <= 0 ? 20 : num;
  })
  limit?: number = 20;
}

export interface PaginationResponse<TData = any[]> {
  data: TData;
  total: number;
  page: number;
  total_pages: number;
}
