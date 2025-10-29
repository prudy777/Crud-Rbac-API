import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_PERMS_KEY } from '../decorator/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const needPerms: string[] =
      this.reflector.getAllAndOverride(REQUIRE_PERMS_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    // nothing required -> allow
    if (!needPerms.length) return true;

    const req = ctx.switchToHttp().getRequest();
    const userPerms: string[] = req.user?.perms ?? [];

    const missing = needPerms.filter((p) => !userPerms.includes(p));
    if (missing.length) {
      throw new ForbiddenException(`Missing permissions: ${missing.join(', ')}`);
    }
    return true;
  }
}
