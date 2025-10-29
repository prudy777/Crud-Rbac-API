import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Request,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  HttpCode,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUsertDto } from './dtos/update-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UsersService } from './users.service';
import { Public } from '../../common/decorator/public.decorator';
import { IsMineGuard } from '../../common/guards/is-mine.guard';
import { QueryUserDto } from './dtos/query-user.dto';
import { SetUserRolesDto } from './dtos/set-user-roles.dto';
import { RequirePermissions } from '../../common/decorator/require-permissions.decorator';

import { UserSafeDto } from './dtos/user-safe.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

import type { UserSafe } from './users.service';
import type { Request as ExpressRequest } from 'express';
import type { UserPayload, LoginResponse } from './interfaces/users-login.interface';

type AuthRequest = ExpressRequest & { user: UserPayload };

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user', operationId: 'registerUser' })
  @ApiResponse({ status: 201, description: 'Created', type: UserSafeDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict (email already exists)' })
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<UserSafe> {
    return this.usersService.registerUser(createUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email & password', operationId: 'loginUser' })
  @ApiResponse({ status: 200, description: 'OK', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return this.usersService.loginUser(loginUserDto);
  }

  @Get()
  @RequirePermissions('user:read')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List users (admin)', operationId: 'listUsers' })
  @ApiResponse({
    status: 200,
    description: 'OK',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/UserSafeDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            lastPage: { type: 'number' },
            currentPage: { type: 'number' },
            totalPerPage: { type: 'number' },
            prevPage: { type: 'number', nullable: true },
            nextPage: { type: 'number', nullable: true },
          },
        },
      },
    },
  })
  list(@Query() q: QueryUserDto) {
    return this.usersService.list(q);
  }

  @Put(':id/roles')
  @RequirePermissions('user:update')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Replace roles for a user (admin)', operationId: 'setUserRoles' })
  @ApiResponse({ status: 200, description: 'OK', schema: { example: { message: 'Updated', count: 2 } } })
  setRoles(@Param('id', ParseIntPipe) id: number, @Body() dto: SetUserRolesDto) {
    return this.usersService.setUserRoles(id, dto.roleIds);
  }

  @Get('me')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get current user payload (from JWT)', operationId: 'me' })
  @ApiResponse({
    status: 200,
    description: 'OK',
    schema: { example: { sub: 1, name: 'John Doe', email: 'email@example.com' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Request() req: AuthRequest): UserPayload {
    return req.user;
  }

  @Patch(':id')
  @UseGuards(IsMineGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Update a user (self/owner protected by IsMineGuard)', operationId: 'updateUser' })
  @ApiResponse({ status: 200, description: 'OK', type: UserSafeDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUsertDto,
  ): Promise<UserSafe> {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(IsMineGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Delete a user (self/owner protected by IsMineGuard)', operationId: 'deleteUser' })
  @ApiResponse({ status: 200, description: 'OK', schema: { example: 'Deleted' } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.usersService.deleteUser(+id);
  }
}
