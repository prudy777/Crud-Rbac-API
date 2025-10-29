import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['user:create', 'user:read', 'role:update'],
    description: 'List of permission slugs to set on this role (replaces existing)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionSlugs: string[];
}
