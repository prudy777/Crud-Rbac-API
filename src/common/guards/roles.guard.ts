import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { PERMS_KEY } from '../decorator/perms.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const needRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]) ?? [];
    const needPerms = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]) ?? [];

    // if nothing required, allow (AuthGuard already ran)
    if (!needRoles.length && !needPerms.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    const userRoles: string[] = user?.roles ?? [];
    const userPerms: string[] = user?.perms ?? [];

    const lacksRole = needRoles.some(r => !userRoles.includes(r));
    const lacksPerm = needPerms.some(p => !userPerms.includes(p));

    if (lacksRole || lacksPerm) {
      throw new ForbiddenException('Insufficient role/permission');
    }
    return true;
  }
}
