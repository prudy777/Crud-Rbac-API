// src/modules/permissions/permissions.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorator/require-permissions.decorator';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { QueryPermissionDto } from './dtos/query-permission.dto';
import { PermissionDto } from './dtos/permission.dto';

@ApiTags('permissions')
@ApiBearerAuth('bearerAuth')
@Controller('permissions')
export class PermissionsController {
  constructor(private svc: PermissionsService) {}

  @Post()
  @RequirePermissions('permission:create')
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponse({ status: 201, type: PermissionDto })
  create(@Body() dto: CreatePermissionDto) {
    return this.svc.create(dto);
  }

  @Get()
  @RequirePermissions('permission:read')
  @ApiOperation({ summary: 'List permissions with filters/sorting/pagination' })
  @ApiResponse({ status: 200, schema: {
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/PermissionDto' } },
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
  }})
  list(@Query() q: QueryPermissionDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @RequirePermissions('permission:read')
  @ApiOperation({ summary: 'Get permission by id' })
  @ApiResponse({ status: 200, type: PermissionDto })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Patch(':id')
  @RequirePermissions('permission:update')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, type: PermissionDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('permission:delete')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Deleted' } } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
