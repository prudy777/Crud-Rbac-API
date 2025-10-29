import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignPermissionsToGroupDto {
  @ApiProperty({
    example: ['user:create', 'user:read'],
    description: 'List of permission slugs to set on this group (replaces existing)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionSlugs: string[];
}
