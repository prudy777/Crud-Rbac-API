import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/services/prisma.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { QueryRoleDto } from './dtos/query-role.dto';
import { AssignPermissionsDto } from './dtos/assign-permissions.dto';

const SORT_WHITELIST = new Set(['id', 'name', 'slug', 'createdAt', 'updatedAt']);

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: { name: dto.name, slug: dto.slug, description: dto.description },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Role name/slug already exists');
      throw e;
    }
  }

  private buildWhere(q: QueryRoleDto) {
    const where: any = {};
    if (q.name) where.name = { contains: q.name, mode: 'insensitive' };
    if (q.slug) where.slug = { contains: q.slug, mode: 'insensitive' };
    if (q.createdFrom || q.createdTo) {
      where.createdAt = {};
      if (q.createdFrom) where.createdAt.gte = new Date(q.createdFrom);
      if (q.createdTo) where.createdAt.lte = new Date(q.createdTo);
    }
    if (q.q) {
      where.OR = [
        { name: { contains: q.q, mode: 'insensitive' } },
        { slug: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  async list(q: QueryRoleDto) {
    const page = q.page ?? 1;
    const size = q.size ?? 10;

    const where = this.buildWhere(q);
    const orderByField = q.sortBy && SORT_WHITELIST.has(q.sortBy) ? q.sortBy : 'id';
    const orderBy = { [orderByField]: q.order ?? 'asc' } as any;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / size));
    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        totalPerPage: size,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < lastPage ? page + 1 : null,
      },
    };
  }

  async get(id: number) {
    const item = await this.prisma.role.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Role not found');
    return item;
  }

  async update(id: number, dto: UpdateRoleDto) {
    try {
      return await this.prisma.role.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Role not found');
      if (e.code === 'P2002') throw new ConflictException('Role name/slug already exists');
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.role.delete({ where: { id } });
      return { message: 'Deleted' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Role not found');
      throw e;
    }
  }

  async setPermissions(roleId: number, dto: AssignPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const perms = await this.prisma.permission.findMany({
      where: { slug: { in: dto.permissionSlugs } },
      select: { id: true, slug: true },
    });
    const foundSlugs = new Set(perms.map(p => p.slug));
    const missing = dto.permissionSlugs.filter(s => !foundSlugs.has(s));
    if (missing.length) {
      throw new NotFoundException(`Permissions not found: ${missing.join(', ')}`);
    }

    // Replace existing permissions
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: perms.map(p => ({ roleId, permissionId: p.id })),
        skipDuplicates: true,
      }),
    ]);

    return { message: 'Updated', count: perms.length };
  }
}
