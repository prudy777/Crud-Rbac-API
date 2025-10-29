import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrator' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Full system access' })
  @IsOptional()
  @IsString()
  description?: string;
}
