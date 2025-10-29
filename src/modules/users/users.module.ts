import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { IsMineGuard } from 'src/common/guards/is-mine.guard';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, IsMineGuard],
})
export class UsersModule {}