// src/modules/posts/posts.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Post as PrismaPost } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { paginate, paginateOutput } from 'src/common/utils/pagination.utils';
import type { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto): Promise<PrismaPost> {
    try {
      return await this.prisma.post.create({ data: { ...createPostDto } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ConflictException('Unique constraint failed');
        if (e.code === 'P2003') throw new NotFoundException('Author not found');
      }
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  // ✅ Paginated list
  async getAllPosts(
    query?: QueryPaginationDto,
  ): Promise<ReturnType<typeof paginateOutput<PrismaPost>>> {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({ ...paginate(query) }),
      this.prisma.post.count(),
    ]);

    return paginateOutput<PrismaPost>(posts, total, query);
  }

  async getPostById(id: number): Promise<PrismaPost> {
    try {
      return await this.prisma.post.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to fetch post');
    }
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<PrismaPost> {
    try {
      await this.prisma.post.findUniqueOrThrow({ where: { id } });
      return await this.prisma.post.update({ where: { id }, data: { ...updatePostDto } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new NotFoundException(`Post with id ${id} not found`);
        if (e.code === 'P2002') throw new ConflictException('Unique constraint failed');
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async deletePost(id: number): Promise<string> {
    try {
      const post = await this.prisma.post.findUniqueOrThrow({ where: { id } });
      await this.prisma.post.delete({ where: { id } });
      return `Post with id ${post.id} deleted`;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Post with id ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }
}
