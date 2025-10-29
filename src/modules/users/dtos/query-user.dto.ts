import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { QueryListDto } from '../../../common/dtos/query-list.dto';

/**
 * NOTE:
 * - We DO NOT redeclare `createdFrom` / `createdTo` here to avoid
 *   clashing with `QueryListDto` (your error screenshot).
 */
export class QueryUserDto extends QueryListDto {
  @ApiPropertyOptional({ example: 'john@acme.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  name?: string;
}
