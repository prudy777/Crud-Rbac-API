import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/services/prisma.service';
import { CreatePermissionGroupDto } from './dtos/create-permission-group.dto';
import { UpdatePermissionGroupDto } from './dtos/update-permission-group.dto';
import { QueryPermissionGroupDto } from './dtos/query-permission-group.dto';

@Injectable()
export class PermissionGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  private rethrow(e: unknown): never {
    const err = e as { code?: string };
    if (err?.code === 'P2002') throw new ConflictException('Slug or name already exists');
    if (err?.code === 'P2025') throw new NotFoundException('Record not found');
    throw e as any;
  }

  async create(dto: CreatePermissionGroupDto) {
    try {
      return await this.prisma.permissionGroup.create({ data: dto });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async list(q: QueryPermissionGroupDto) {
    const page = q.page ?? 1;
    const size = q.size ?? 10;

    const where: any = {};
    if (q.name) where.name = { contains: q.name, mode: 'insensitive' };
    if (q.slug) where.slug = { contains: q.slug, mode: 'insensitive' };
    if (q.q) {
      where.OR = [
        { name: { contains: q.q, mode: 'insensitive' } },
        { slug: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.permissionGroup.count({ where }),
      this.prisma.permissionGroup.findMany({
        where,
        orderBy: { [q.sortBy ?? 'id']: q.order ?? 'asc' },
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / size));
    return {
      data: items,
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
    const r = await this.prisma.permissionGroup.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Permission group not found');
    return r;
  }

  async update(id: number, dto: UpdatePermissionGroupDto) {
    try {
      return await this.prisma.permissionGroup.update({ where: { id }, data: dto });
    } catch (e) {
      this.rethrow(e);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.permissionGroup.delete({ where: { id } });
      return { message: 'Deleted' };
    } catch (e) {
      this.rethrow(e);
    }
  }

  /**
   * Primary method: assign by IDs
   */
  async setGroupPermissions(groupId: number, permissionIds: number[]) {
    // ensure group exists (use findUnique because tests mock findUnique)
    const grp = await this.prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!grp) throw new NotFoundException('Permission group not found');

    const ids = Array.from(new Set(permissionIds));
    await this.prisma.$transaction([
      // unlink any currently linked permissions that are no longer in the input
      this.prisma.permission.updateMany({
        where: { groupId: groupId, id: { notIn: ids.length ? ids : [0] } },
        data: { groupId: null },
      }),
      // link provided ids to this group
      this.prisma.permission.updateMany({
        where: { id: { in: ids.length ? ids : [0] } },
        data: { groupId: groupId },
      }),
    ]);

    const count = await this.prisma.permission.count({
      where: { id: { in: ids }, groupId: groupId },
    });

    return { message: 'Updated', count };
  }

  /**
   * Compatibility method for existing tests: assign by slugs
   * dto: { permissionSlugs: string[] }
   */
  async setPermissions(groupId: number, dto: { permissionSlugs: string[] }) {
    const grp = await this.prisma.permissionGroup.findUnique({ where: { id: groupId } });
    if (!grp) throw new NotFoundException('Permission group not found');

    const slugs = Array.from(new Set(dto.permissionSlugs ?? []));
    if (!slugs.length) {
      return { message: 'Updated', count: 0 };
    }

    const perms = await this.prisma.permission.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });

    if (perms.length !== slugs.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    const ids = perms.map((p) => p.id);
    return this.setGroupPermissions(groupId, ids);
  }
}
