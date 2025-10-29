// src/modules/permission-groups/permission-groups.service.spec.ts
import { Test } from '@nestjs/testing';
import { PermissionGroupsService } from './permission-groups.service';
import { PrismaService } from '../../core/services/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prismaMock } from '../../../test/mocks/prisma.service';

describe('PermissionGroupsService', () => {
  let service: PermissionGroupsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionGroupsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(PermissionGroupsService);
  });

  it('create: success', async () => {
    (prismaMock.permissionGroup.create as jest.Mock).mockResolvedValue({ id: 1, name: 'Users', slug: 'users' });
    const r = await service.create({ name: 'Users', slug: 'users' } as any);
    expect(r.id).toBe(1);
  });

  it('create: conflict', async () => {
    (prismaMock.permissionGroup.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.create({ name: 'Users', slug: 'users' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('list', async () => {
    (prismaMock.$transaction as jest.Mock).mockResolvedValue([0, []]);
    const r = await service.list({ page: 1, size: 10 } as any);
    expect(r.meta.total).toBe(0);
  });

  it('get: not found', async () => {
    (prismaMock.permissionGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.get(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: not found', async () => {
    (prismaMock.permissionGroup.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove: not found', async () => {
    (prismaMock.permissionGroup.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: group not found', async () => {
    (prismaMock.permissionGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.setPermissions(1, { permissionSlugs: [] } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: missing slugs', async () => {
    (prismaMock.permissionGroup.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.permission.findMany as jest.Mock).mockResolvedValue([{ id: 1, slug: 'x' }]);
    await expect(service.setPermissions(1, { permissionSlugs: ['x','y'] } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: success', async () => {
    (prismaMock.permissionGroup.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.permission.findMany as jest.Mock).mockResolvedValue([{ id: 1, slug: 'x' }]);
    (prismaMock.$transaction as jest.Mock).mockResolvedValue([{}, {}]);
    const r = await service.setPermissions(1, { permissionSlugs: ['x'] } as any);
    expect(r).toEqual({ message: 'Updated', count: 1 });
  });
});
