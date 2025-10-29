import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'email@example.com',
    description: 'The email of the new user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'super_secret_password',
    description: 'The password of the new user',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the new user',
  })
  @IsNotEmpty()
  name: string;
}
