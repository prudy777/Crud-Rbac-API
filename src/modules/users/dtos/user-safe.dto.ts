import { ApiProperty } from '@nestjs/swagger';

// Reflects a "safe user" (i.e., Omit<User, 'password'>)
// Add/remove fields to match your Prisma model.
export class UserSafeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'email@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ example: '2025-10-29T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-29T10:10:00.000Z' })
  updatedAt: Date;
}
