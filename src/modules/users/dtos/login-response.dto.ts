import { ApiProperty } from '@nestjs/swagger';
import { UserSafeDto } from './user-safe.dto';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsIm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiZW1haWxAZXhhbXBsZS5jb20ifQ.sometest',
  })
  access_token: string;

  @ApiProperty({ type: UserSafeDto, description: 'Authenticated user (safe)' })
  user: UserSafeDto;
}
