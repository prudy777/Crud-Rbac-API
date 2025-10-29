// src/modules/permissions/dtos/query-permission.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { QueryListDto } from '../../../common/dtos/query-list.dto';

export class QueryPermissionDto extends QueryListDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() groupSlug?: string;
}
