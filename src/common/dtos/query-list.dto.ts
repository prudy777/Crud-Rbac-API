// src/common/dtos/query-list.dto.ts
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryListDto {
  // pagination
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) size?: number = 10;

  // sorting
  @IsOptional() @IsString() sortBy?: string;              // will be validated against a whitelist in service
  @IsOptional() @IsIn(['asc', 'desc']) order?: 'asc' | 'desc' = 'asc';

  // common free-text (optional)
  @IsOptional() @IsString() q?: string;

  // date range (optional)
  @IsOptional() @IsString() createdFrom?: string; // ISO date; keep string to avoid transform surprises
  @IsOptional() @IsString() createdTo?: string;
}
