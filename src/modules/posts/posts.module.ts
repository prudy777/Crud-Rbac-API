// src/modules/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CoreModule } from 'src/core/core.module'; // provides PrismaService
import { IsMineGuard } from 'src/common/guards/is-mine.guard';

@Module({
  imports: [CoreModule],
  controllers: [PostsController],
  providers: [PostsService, IsMineGuard],
  exports: [PostsService],
})
export class PostsModule {}
