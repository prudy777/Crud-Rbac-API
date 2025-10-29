import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionGroupsService } from './permission-groups.service';
import { CreatePermissionGroupDto } from './dtos/create-permission-group.dto';
import { UpdatePermissionGroupDto } from './dtos/update-permission-group.dto';
import { PermissionGroupDto } from './dtos/permission-group.dto';
import { QueryPermissionGroupDto } from './dtos/query-permission-group.dto';
import { AssignPermissionsToGroupDto } from './dtos/assign-permissions-to-group.dto';
import { RequirePermissions } from '../../common/decorator/require-permissions.decorator';

@ApiTags('permission-groups')
@ApiBearerAuth('bearerAuth')
@Controller('permission-groups')
export class PermissionGroupsController {
  constructor(private svc: PermissionGroupsService) {}

  @Post()
  @RequirePermissions('group:create')
  @ApiOperation({ summary: 'Create permission group' })
  @ApiResponse({ status: 201, type: PermissionGroupDto })
  create(@Body() dto: CreatePermissionGroupDto) {
    return this.svc.create(dto);
  }

  @Get()
  @RequirePermissions('group:read')
  @ApiOperation({ summary: 'List permission groups with filters/sorting/pagination' })
  @ApiResponse({ status: 200, schema: {
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/PermissionGroupDto' } },
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
  list(@Query() q: QueryPermissionGroupDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @RequirePermissions('group:read')
  @ApiOperation({ summary: 'Get permission group by id' })
  @ApiResponse({ status: 200, type: PermissionGroupDto })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Patch(':id')
  @RequirePermissions('group:update')
  @ApiOperation({ summary: 'Update permission group' })
  @ApiResponse({ status: 200, type: PermissionGroupDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePermissionGroupDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('group:delete')
  @ApiOperation({ summary: 'Delete permission group' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Deleted' } } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(':id/permissions:set')
  @RequirePermissions('group:update')
  @ApiOperation({ summary: 'Replace group permissions with provided list (by slug)' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Updated', count: 2 } } })
  setPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignPermissionsToGroupDto) {
    return this.svc.setPermissions(id, dto);
  }
}
