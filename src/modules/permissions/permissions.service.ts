// src/modules/permissions/permissions.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/services/prisma.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { QueryPermissionDto } from './dtos/query-permission.dto';

const SORT_WHITELIST = new Set(['id', 'name', 'slug', 'createdAt', 'updatedAt']);

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    // resolve group
    let groupId: number | undefined;
    if (dto.groupSlug) {
      const group = await this.prisma.permissionGroup.findUnique({ where: { slug: dto.groupSlug } });
      if (!group) throw new NotFoundException(`Permission group '${dto.groupSlug}' not found`);
      groupId = group.id;
    }
    try {
      return await this.prisma.permission.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          groupId,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Permission slug already exists');
      throw e;
    }
  }

  private buildWhere(q: QueryPermissionDto) {
    const where: any = {};
    if (q.name) where.name = { contains: q.name, mode: 'insensitive' };
    if (q.slug) where.slug = { contains: q.slug, mode: 'insensitive' };
    if (q.groupSlug) where.group = { slug: q.groupSlug };
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

  async list(q: QueryPermissionDto) {
    const page = q.page ?? 1;
    const size = q.size ?? 10;

    const where = this.buildWhere(q);

    const orderByField = q.sortBy && SORT_WHITELIST.has(q.sortBy) ? q.sortBy : 'id';
    const orderBy = { [orderByField]: q.order ?? 'asc' } as any;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.permission.count({ where }),
      this.prisma.permission.findMany({
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
    const item = await this.prisma.permission.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Permission not found');
    return item;
  }

  async update(id: number, dto: UpdatePermissionDto) {
    try {
      return await this.prisma.permission.update({ where: { id }, data: dto });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Permission not found');
      if (e.code === 'P2002') throw new ConflictException('Permission slug already exists');
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.permission.delete({ where: { id } });
      return { message: 'Deleted' };
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Permission not found');
      throw e;
    }
  }
}
