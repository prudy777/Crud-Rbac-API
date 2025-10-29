import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PermissionGroupsModule } from './modules/permission-groups/permission-groups.module';
import { PostsModule } from './modules/posts/posts.module';

import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PermissionGroupsModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },   // 1st: auth
    { provide: APP_GUARD, useClass: RolesGuard },  // 2nd: rbac
    { provide: APP_GUARD, useClass: PermissionsGuard }
  ],
})
export class AppModule {}
