import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignPermissionsToGroupDto {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map((v) => parseInt(v, 10)) : [],
  )
  permissionIds!: number[];
}
