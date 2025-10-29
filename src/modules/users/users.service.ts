// src/modules/users/users.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../core/services/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UpdateUsertDto } from './dtos/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { QueryUserDto } from './dtos/query-user.dto';
import { LoginResponse, UserPayload } from './interfaces/users-login.interface';

// Keep the shape minimal and stable across Prisma versions (no timestamps assumed)
type DbUser = {
  id: number;
  email: string;
  password: string;
  name: string | null;
};

export type UserSafe = Omit<DbUser, 'password'>;

// whitelist sort fields (outside the class to avoid TS1248)
const USER_SORT_WHITELIST = new Set(['id', 'email', 'name']);

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ---------- Utilities ----------
  private toSafe(u: DbUser): UserSafe {
    const { password, ...safe } = u;
    return safe;
  }

  private rethrow(e: unknown): never {
    const err = e as { code?: string };
    if (err?.code === 'P2002') throw new ConflictException('Email already registered');
    if (err?.code === 'P2025') throw new NotFoundException('Record not found');
    throw new InternalServerErrorException('Unexpected error');
  }

  // ---------- Auth ----------
  async registerUser(dto: CreateUserDto): Promise<UserSafe> {
    try {
      // If on Prisma 5+, `omit` is supported and returns everything except password.
      // If you're on Prisma 4, switch to `select: { id: true, email: true, name: true, password: true }` and then toSafe.
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: await hash(dto.password, 10),
          name: dto.name,
        },
        omit: { password: true } as any,
      });

      // `omit` already removed password; but keep a cast for shared toSafe usage.
      return user as unknown as UserSafe;
    } catch (e) {
      this.rethrow(e);
    }
  }

  async loginUser(dto: LoginUserDto): Promise<LoginResponse> {
    try {
      const user = (await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true, email: true, password: true, name: true },
      })) as DbUser | null;

      if (!user) throw new NotFoundException('User not found');

      const ok = await compare(dto.password, user.password);
      if (!ok) throw new UnauthorizedException('Invalid credentials');

      const payload: UserPayload = { sub: user.id, email: user.email, name: user.name };
      return { access_token: await this.jwtService.signAsync(payload) };
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof UnauthorizedException) throw e;
      this.rethrow(e);
    }
  }

  // ---------- CRUD ----------
  async updateUser(id: number, dto: UpdateUsertDto): Promise<UserSafe> {
    try {
      await this.prisma.user.findUniqueOrThrow({ where: { id } });

      const data: Partial<DbUser & { password?: string }> = { ...dto } as any;
      if ((dto as any).password) data.password = await hash((dto as any).password, 10);

      // Return all fields except password (Prisma 5 `omit`). If on 4.x, use `select` and `toSafe`.
      const updated = (await this.prisma.user.update({
        where: { id },
        data,
        omit: { password: true } as any,
      })) as unknown as UserSafe;

      return updated;
    } catch (e) {
      this.rethrow(e);
    }
  }

  async deleteUser(id: number): Promise<string> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return 'Deleted';
    } catch (e) {
      this.rethrow(e);
    }
  }

  // ---------- Listing (filters + sort + pagination) ----------
  async list(q: QueryUserDto) {
    const page = q.page ?? 1;
    const size = q.size ?? 10;

    const where: any = {};
    if (q.email) where.email = { contains: q.email, mode: 'insensitive' };
    if (q.name) where.name = { contains: q.name, mode: 'insensitive' };
    if (q.q) {
      where.OR = [
        { email: { contains: q.q, mode: 'insensitive' } },
        { name: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.user.count({ where });
    const lastPage = Math.max(1, Math.ceil(total / size));
    const orderBy =
      q.sortBy && USER_SORT_WHITELIST.has(q.sortBy)
        ? { [q.sortBy]: q.order ?? 'asc' }
        : { id: 'asc' as const };

    const data = await this.prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * size,
      take: size,
      select: { id: true, email: true, name: true },
    });

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

  // ---------- RBAC: set roles for user ----------
  async setUserRoles(userId: number, roleIds: number[]) {
    await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roles.map((r) => ({ userId, roleId: r.id })),
        skipDuplicates: true,
      }),
    ]);

    return { message: 'Updated', count: roles.length };
  }
}
