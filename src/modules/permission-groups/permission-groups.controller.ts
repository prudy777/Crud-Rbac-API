import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionGroupsService } from './permission-groups.service';
import { CreatePermissionGroupDto } from './dtos/create-permission-group.dto';
import { UpdatePermissionGroupDto } from './dtos/update-permission-group.dto';
import { QueryPermissionGroupDto } from './dtos/query-permission-group.dto';
import { AssignPermissionsToGroupDto } from './dtos/assign-permissions-to-group.dto';
import { RequirePermissions } from '../../common/decorator/require-permissions.decorator';

@ApiTags('permission-groups')
@ApiBearerAuth('bearerAuth')
@Controller('permission-groups')
export class PermissionGroupsController {
  constructor(private readonly svc: PermissionGroupsService) {}

  @Get()
  @RequirePermissions('group:read')
  @ApiOperation({ summary: 'List permission groups' })
  list(@Query() q: QueryPermissionGroupDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @RequirePermissions('group:read')
  @ApiOperation({ summary: 'Get a permission group by id' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.get(id);
  }

  @Post()
  @RequirePermissions('group:create')
  @ApiOperation({ summary: 'Create permission group' })
  create(@Body() dto: CreatePermissionGroupDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('group:update')
  @ApiOperation({ summary: 'Update permission group' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionGroupDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('group:delete')
  @ApiOperation({ summary: 'Delete permission group' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Deleted' } } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  /**
   * Replace group permissions with provided list.
   * Accepts either permissionIds OR permissionSlugs in the same DTO.
   */
  @Post(':id/permissions:set')
  @RequirePermissions('group:update')
  @ApiOperation({ summary: 'Replace group permissions (accepts IDs or slugs)' })
  @ApiResponse({ status: 200, schema: { example: { message: 'Updated', count: 2 } } })
  setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsToGroupDto,
  ) {
    if (dto.permissionIds?.length) {
      return this.svc.setGroupPermissions(id, dto.permissionIds);
    }
    if (dto.permissionSlugs?.length) {
      return this.svc.setPermissions(id, { permissionSlugs: dto.permissionSlugs });
    }
    // nothing provided -> no-op update
    return this.svc.setGroupPermissions(id, []);
  }
}
