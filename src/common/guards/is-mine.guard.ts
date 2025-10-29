// src/common/guards/is-mine.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/services/prisma.service';

@Injectable()
export class IsMineGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req?.user;                 // injected by AuthGuard
    const targetIdRaw = req?.params?.id;

    if (!user) throw new ForbiddenException('Forbidden');

    const targetId = Number(targetIdRaw);
    if (!Number.isFinite(targetId)) throw new ForbiddenException('Forbidden');

    // Allow if resource belongs to the requester
    if (user.sub === targetId) return true;

    // Optionally, allow admins to bypass (uncomment if desired)
    // const adminRole = await this.prisma.role.findFirst({ where: { slug: 'admin' } });
    // if (adminRole) {
    //   const hasAdmin = await this.prisma.userRole.findFirst({
    //     where: { userId: user.sub, roleId: adminRole.id },
    //   });
    //   if (hasAdmin) return true;
    // }

    throw new ForbiddenException('Forbidden');
  }
}
