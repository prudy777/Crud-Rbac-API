// src/modules/permission-groups/permission-groups.controller.spec.ts
import { Test } from '@nestjs/testing';
import { PermissionGroupsController } from './permission-groups.controller';
import { PermissionGroupsService } from './permission-groups.service';

describe('PermissionGroupsController', () => {
  let ctrl: PermissionGroupsController;
  const svc = {
    create: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setPermissions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await Test.createTestingModule({
      controllers: [PermissionGroupsController],
      providers: [{ provide: PermissionGroupsService, useValue: svc }],
    }).compile();
    ctrl = mod.get(PermissionGroupsController);
  });

  it('create', async () => {
    svc.create.mockResolvedValue({ id: 1 });
    const r = await ctrl.create({} as any);
    expect(r).toEqual({ id: 1 });
  });

  it('list', async () => {
    svc.list.mockResolvedValue({ data: [], meta: { total: 0 } });
    const r = await ctrl.list({} as any);
    expect(r.meta.total).toBe(0);
  });

  it('get', async () => {
    svc.get.mockResolvedValue({ id: 1 });
    const r = await ctrl.get(1 as any);
    expect(r.id).toBe(1);
  });

  it('update', async () => {
    svc.update.mockResolvedValue({ id: 1 });
    const r = await ctrl.update(1 as any, {} as any);
    expect(r.id).toBe(1);
  });

  it('remove', async () => {
    svc.remove.mockResolvedValue({ message: 'Deleted' });
    const r = await ctrl.remove(1 as any);
    expect(r).toEqual({ message: 'Deleted' });
  });

  it('setPermissions', async () => {
    svc.setPermissions.mockResolvedValue({ message: 'Updated', count: 2 });
    const r = await ctrl.setPermissions(1 as any, { permissionSlugs: ['a','b'] } as any);
    expect(r.count).toBe(2);
  });
});
