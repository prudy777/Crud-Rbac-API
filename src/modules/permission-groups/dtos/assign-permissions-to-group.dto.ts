import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignPermissionsToGroupDto {
  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => parseInt(v, 10)) : undefined,
  )
  permissionIds?: number[];

  @ApiPropertyOptional({ type: [String], example: ['users.read', 'users.write'] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionSlugs?: string[];
}
