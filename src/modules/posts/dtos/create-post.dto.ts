// src/modules/posts/dtos/create-post.dto.ts
import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean = false;

  // set by controller from JWT; optional in payload
  @IsOptional()
  @IsInt()
  authorId?: number;
}
