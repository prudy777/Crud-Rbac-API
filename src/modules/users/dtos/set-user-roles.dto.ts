import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class SetUserRolesDto {
  @ApiProperty({
    example: [1, 2],
    description: 'Role IDs to set for the user. This REPLACES existing roles.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roleIds: number[];
}
