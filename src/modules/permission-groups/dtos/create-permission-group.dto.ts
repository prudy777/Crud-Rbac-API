import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionGroupDto {
  @ApiProperty({ example: 'Users' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'users' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Permissions related to users domain' })
  @IsOptional()
  @IsString()
  description?: string;
}
