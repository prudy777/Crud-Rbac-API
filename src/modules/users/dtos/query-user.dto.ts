import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  size?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['id', 'email', 'name'],
    default: 'id',
  })
  @IsOptional()
  @IsIn(['id', 'email', 'name'])
  sortBy?: 'id' | 'email' | 'name' = 'id';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Filter by exact/partial email (case-insensitive)' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by partial name (case-insensitive)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Free text search on email/name (case-insensitive)' })
  @IsOptional()
  @IsString()
  q?: string;
}
