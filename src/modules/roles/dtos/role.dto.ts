import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) description?: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
