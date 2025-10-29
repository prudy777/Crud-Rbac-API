// src/modules/permissions/dtos/permission.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) description?: string | null;
  @ApiProperty({ nullable: true }) groupId?: number | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
