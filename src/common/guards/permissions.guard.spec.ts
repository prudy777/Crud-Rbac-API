// src/common/guards/permissions.guard.spec.ts
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/services/prisma.service';

function mockCtx(user?: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('PermissionsGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const prisma = {
    rolePermission: {
      findMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows when no permissions required', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(undefined);
    const guard = new PermissionsGuard(reflector, prisma);
    await expect(guard.canActivate(mockCtx())).resolves.toBe(true);
  });

  it('denies when no user', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['role:read']);
    const guard = new PermissionsGuard(reflector, prisma);
    await expect(guard.canActivate(mockCtx(undefined))).rejects.toBeTruthy();
  });

  it('allows when user has all required permissions', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['a','b']);
    (prisma.rolePermission.findMany as any).mockResolvedValue([
      { permission: { slug: 'a' } },
      { permission: { slug: 'b' } },
    ]);
    const guard = new PermissionsGuard(reflector, prisma);
    await expect(guard.canActivate(mockCtx({ sub: 1 }))).resolves.toBe(true);
  });

  it('denies when user misses any permission', async () => {
    (reflector.getAllAndOverride as any).mockReturnValue(['a','b']);
    (prisma.rolePermission.findMany as any).mockResolvedValue([{ permission: { slug: 'a' } }]);
    const guard = new PermissionsGuard(reflector, prisma);
    await expect(guard.canActivate(mockCtx({ sub: 1 }))).rejects.toBeTruthy();
  });
});
