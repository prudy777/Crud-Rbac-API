// src/modules/roles/roles.service.spec.ts
import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from '../../core/services/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prismaMock } from '../../../test/mocks/prisma.service';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(RolesService);
  });

  it('create: success', async () => {
    const dto = { name: 'Admin', slug: 'admin', description: 'all' };
    (prismaMock.role.create as jest.Mock).mockResolvedValue({ id: 1, ...dto });
    const res = await service.create(dto as any);
    expect(prismaMock.role.create).toHaveBeenCalled();
    expect(res.id).toBe(1);
  });

  it('create: conflict (P2002)', async () => {
    (prismaMock.role.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.create({ name: 'Admin', slug: 'admin' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('list: paginated, with sort fallback', async () => {
    (prismaMock.$transaction as jest.Mock).mockResolvedValue([1, [{ id: 1 }]]);
    const res = await service.list({ page: 1, size: 10, sortBy: 'unknown', order: 'asc' } as any);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(res.meta.total).toBe(1);
    expect(res.data.length).toBe(1);
  });

  it('get: found', async () => {
    (prismaMock.role.findUnique as jest.Mock).mockResolvedValue({ id: 1, name: 'Admin', slug: 'admin' });
    const r = await service.get(1);
    expect(r.id).toBe(1);
  });

  it('get: not found', async () => {
    (prismaMock.role.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.get(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: success', async () => {
    (prismaMock.role.update as jest.Mock).mockResolvedValue({ id: 1, description: 'new' });
    const r = await service.update(1, { description: 'new' } as any);
    expect(r.id).toBe(1);
  });

  it('update: not found (P2025)', async () => {
    (prismaMock.role.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: conflict (P2002)', async () => {
    (prismaMock.role.update as jest.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('remove: success', async () => {
    (prismaMock.role.delete as jest.Mock).mockResolvedValue({});
    const r = await service.remove(1);
    expect(r).toEqual({ message: 'Deleted' });
  });

  it('remove: not found (P2025)', async () => {
    (prismaMock.role.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: role not found', async () => {
    (prismaMock.role.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.setPermissions(1, { permissionSlugs: [] } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: missing permission slugs', async () => {
    (prismaMock.role.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.permission.findMany as jest.Mock).mockResolvedValue([{ id: 10, slug: 'x' }]);
    await expect(service.setPermissions(1, { permissionSlugs: ['x', 'y'] } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('setPermissions: success', async () => {
    (prismaMock.role.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prismaMock.permission.findMany as jest.Mock).mockResolvedValue([{ id: 10, slug: 'x' }]);
    (prismaMock.$transaction as jest.Mock).mockResolvedValue([{}, { count: 1 }]);
    const r = await service.setPermissions(1, { permissionSlugs: ['x'] } as any);
    expect(r).toEqual({ message: 'Updated', count: 1 });
  });
});
