import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/core/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (s: string) => `hashed:${s}`),
  compare: jest.fn(async (raw: string, hashed: string) => hashed === `hashed:${raw}`),
}));

const prismaMock = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  role: { findMany: jest.fn() },
  userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
  $transaction: jest.fn(async (ops: any[]) => {
    for (const op of ops) await op; // simple sequential simulation
  }),
};

const jwtMock = {
  sign: jest.fn(() => 'jwt.token.here'),
  signAsync: jest.fn(async () => 'jwt.token.here'),
};

describe('UsersService', () => {
  let svc: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    // ✅ assign to the outer variable (do NOT redeclare)
    svc = moduleRef.get(UsersService);
  });

  describe('registerUser', () => {
    it('success', async () => {
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        id: 1, email: 'e@e.com', password: 'hashed:pw', name: 'N',
        createdAt: new Date(), updatedAt: new Date(),
      });
      const r = await svc.registerUser({ email: 'e@e.com', password: 'pw', name: 'N' } as any);
      expect(r).toEqual(expect.objectContaining({ id: 1, email: 'e@e.com', name: 'N' }));
    });

    it('unique conflict => ConflictException', async () => {
      (prismaMock.user.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
      await expect(svc.registerUser({} as any)).rejects.toBeInstanceOf(ConflictException);
    });

    it('unexpected error => InternalServerErrorException', async () => {
      (prismaMock.user.create as jest.Mock).mockRejectedValue(new Error('boom'));
      await expect(svc.registerUser({} as any)).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('loginUser', () => {
    it('success + token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1, email: 'e@e.com', password: 'hashed:pw', name: 'N',
      });

      // Either rely on the mock OR spy—both are fine. This keeps your expectations explicit.
      const signSpy = jest
        .spyOn((svc as any).jwtService, 'signAsync')
        .mockResolvedValueOnce('jwt.token.here');

      const r = await svc.loginUser({ email: 'e@e.com', password: 'pw' } as any);

      expect(signSpy).toHaveBeenCalledWith({ sub: 1, email: 'e@e.com', name: 'N' });
      expect(r).toEqual({ access_token: 'jwt.token.here' });
    });

    it('user not found => NotFound', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(svc.loginUser({ email: 'x', password: 'y' } as any))
        .rejects.toBeInstanceOf(NotFoundException);
    });

    it('bad password => Unauthorized', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1, email: 'e@e.com', password: 'hashed:pw', name: 'N',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      await expect(svc.loginUser({ email: 'e@e.com', password: 'wrong' } as any))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('updateUser', () => {
    it('success', async () => {
      (prismaMock.user.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 1 });
      (prismaMock.user.update as jest.Mock).mockResolvedValue({
        id: 1, email: 'e@e.com', password: 'hashed:x', name: 'X',
        createdAt: new Date(), updatedAt: new Date(),
      });
      const r = await svc.updateUser(1, { name: 'X' } as any);
      expect(r).toEqual(expect.objectContaining({ id: 1, email: 'e@e.com', name: 'X' }));
    });

    it('not found => NotFound', async () => {
      (prismaMock.user.findUniqueOrThrow as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(svc.updateUser(1, {} as any)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('unique conflict => Conflict', async () => {
      (prismaMock.user.findUniqueOrThrow as jest.Mock).mockResolvedValue({ id: 1 });
      (prismaMock.user.update as jest.Mock).mockRejectedValue({ code: 'P2002' });
      await expect(svc.updateUser(1, {} as any)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('deleteUser', () => {
    it('success', async () => {
      (prismaMock.user.delete as jest.Mock).mockResolvedValue({});
      const r = await svc.deleteUser(1);
      expect(r).toBe('Deleted');
    });

    it('not found => NotFound', async () => {
      (prismaMock.user.delete as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(svc.deleteUser(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
