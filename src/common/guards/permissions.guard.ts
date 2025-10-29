// src/common/guards/permissions.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/services/prisma.service';
import { PERMS_KEY } from '../decorator/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: number } | undefined;
    if (!user?.sub) throw new ForbiddenException('Forbidden');

    // Collect user permissions via roles
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { role: { userRoles: { some: { userId: user.sub } } } },
      select: { permission: { select: { slug: true } } },
    });

    const userPermSlugs = new Set(rolePerms.map((rp) => rp.permission.slug));
    const ok = required.every((p) => userPermSlugs.has(p));
    if (!ok) throw new ForbiddenException('Forbidden');
    return true;
  }
}
