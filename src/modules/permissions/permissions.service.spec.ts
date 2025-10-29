// src/modules/permissions/permissions.service.spec.ts
import { Test } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../../core/services/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { prismaMock } from '../../../test/mocks/prisma.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(PermissionsService);
  });

  it('create: success without group', async () => {
    (prismaMock.permission.create as jest.Mock).mockResolvedValue({ id: 1, slug: 'x' });
    const r = await service.create({ name: 'X', slug: 'x' } as any);
    expect(r.id).toBe(1);
  });

  it('create: group does not exist', async () => {
    (prismaMock.permissionGroup.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.create({ name: 'X', slug: 'x', groupSlug: 'g' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create: conflict', async () => {
    (prismaMock.permission.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
    await expect(service.create({ name: 'X', slug: 'x' } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('list', async () => {
    (prismaMock.$transaction as jest.Mock).mockResolvedValue([0, []]);
    const r = await service.list({ page: 1, size: 10 } as any);
    expect(r.meta.total).toBe(0);
  });

  it('get: not found', async () => {
    (prismaMock.permission.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.get(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: success', async () => {
    (prismaMock.permission.update as jest.Mock).mockResolvedValue({ id: 1 });
    const r = await service.update(1, {} as any);
    expect(r.id).toBe(1);
  });

  it('update: not found', async () => {
    (prismaMock.permission.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.update(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove: not found', async () => {
    (prismaMock.permission.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
