import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core'; // ✅ direct import

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const reflectorMock: Partial<Reflector> = {
    getAllAndOverride: jest.fn(),
  };

  const jwtServiceMock = {
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflectorMock }, // ✅ token is the class
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    guard = testingModule.get(AuthGuard);
    jest.clearAllMocks();
  });

  it('allows @Public() endpoints', async () => {
    (reflectorMock.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects when no token', async () => {
    (reflectorMock.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts valid token', async () => {
    (reflectorMock.getAllAndOverride as jest.Mock).mockReturnValue(false);
    jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 1 });

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer abc' } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('abc');
  });

  it('rejects invalid token', async () => {
    (reflectorMock.getAllAndOverride as jest.Mock).mockReturnValue(false);
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('bad'));

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer nope' } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
