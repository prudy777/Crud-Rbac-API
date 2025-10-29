import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleDto } from './dtos/role.dto';
import { QueryRoleDto } from './dtos/query-role.dto';
import { AssignPermissionsDto } from './dtos/assign-permissions.dto';
import { RequirePermissions } from '../../common/decorator/require-permissions.decorator';

@ApiTags('roles')
@ApiBearerAuth('bearerAuth')
@Controller('roles')
export class RolesController {
  constructor(private svc: RolesService) {}

  @Post()
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({ status: 201, type: RoleDto })
  create(@Body() dto: CreateRoleDto) {
    return this.svc.create(dto);
  }

  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'List roles with filters/sorting/pagination' })
  @ApiResponse({ status: 200, schema: {
    properties: {
      data: { type: 'array', items: { $ref: '#/components/schemas/RoleDto' } },
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
  list(@Query() q: QueryRoleDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiResponse({ status: 200, type: RoleDto })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Patch(':id')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, type: RoleDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Deleted' } } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(':id/permissions:set')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Replace role permissions with provided list (by slug)' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Updated', count: 3 } } })
  setPermissions(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignPermissionsDto) {
    return this.svc.setPermissions(id, dto);
  }

    @Put(':id/permissions')
  @ApiOperation({ summary: 'Assign permissions to role' })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permissionIds: number[] },
  ) {
    const { permissionIds } = body;
const count = await this.svc.assignPermissions(id, permissionIds);
    return { message: 'Updated', count };
  }
}
