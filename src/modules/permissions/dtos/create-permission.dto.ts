// src/modules/permissions/dtos/create-permission.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Read Users' }) @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ example: 'user:read' })  @IsString() @IsNotEmpty() slug: string;
  @ApiProperty({ example: 'Can read user records', required: false })
  @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 'users', required: false })
  @IsOptional() @IsString() groupSlug?: string; // map to groupId in service
}
