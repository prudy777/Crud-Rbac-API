import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CoreModule } from './core/core.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './common/guards/auth.guard';
import dotenv from 'dotenv';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionGroupsModule } from './modules/permission-groups/permission-groups.module';

// Load environment variables from .env file
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV ? [`.env.${process.env.NODE_ENV}`] : ['.env'],
      isGlobal: true,
    }),
    UsersModule,
    PermissionsModule,
    RolesModule,
    PermissionGroupsModule,
    PostsModule,
    CoreModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev_only_super_secret_key',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
