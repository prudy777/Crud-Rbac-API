// src/modules/posts/posts.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post as HttpPost,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostsService } from './posts.service';
import { Public } from 'src/common/decorator/public.decorator';
import { IsMineGuard } from 'src/common/guards/is-mine.guard';

// type-only imports
import type { Request as ExpressRequest } from 'express';
import type { Post as PrismaPost } from '@prisma/client';
import type { UserPayload } from '../users/interfaces/users-login.interface';
import type { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import type { PaginateOutput } from 'src/common/utils/pagination.utils';

type AuthRequest = ExpressRequest & { user: UserPayload };

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req: AuthRequest,
  ): Promise<PrismaPost> {
    createPostDto.authorId = req.user.sub;
    return this.postsService.createPost(createPostDto);
  }

  @Public()
  @Get()
  getAllPosts(
    @Query() query?: QueryPaginationDto,
  ): Promise<PaginateOutput<PrismaPost>> {
    return this.postsService.getAllPosts(query);
  }

  @Public()
  @Get(':id')
  getPostById(@Param('id', ParseIntPipe) id: number): Promise<PrismaPost> {
    return this.postsService.getPostById(id);
  }

  @Patch(':id')
  @UseGuards(IsMineGuard)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PrismaPost> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(IsMineGuard)
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.postsService.deletePost(id);
  }
}
