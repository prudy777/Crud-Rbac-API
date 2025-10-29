import { IsOptional, IsString } from 'class-validator';
import { QueryListDto } from '../../../common/dtos/query-list.dto';

export class QueryPermissionGroupDto extends QueryListDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
}
