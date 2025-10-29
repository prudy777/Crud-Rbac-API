// src/common/guards/is-mine.guard.spec.ts
import { IsMineGuard } from './is-mine.guard';
import { ForbiddenException } from '@nestjs/common';

const prismaMock: any = {};

const makeCtx = (
  userSub: number | undefined,
  paramId: number,
  method: 'PATCH' | 'DELETE' | 'GET' | 'POST' = 'PATCH',
) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        user: userSub !== undefined ? { sub: userSub } : undefined,
        params: { id: String(paramId) }, // guard converts with Number(...)
        baseUrl: '/users',
        url: `/users/${paramId}`,
        originalUrl: `/users/${paramId}`,
      }),
    }),
  } as any);

describe('IsMineGuard', () => {
  let guard: IsMineGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new IsMineGuard(prismaMock as any);
  });

  it('allows when same user id', async () => {
    await expect(guard.canActivate(makeCtx(5, 5, 'PATCH'))).resolves.toBe(true);
  });

  it('denies when different id', async () => {
    await expect(guard.canActivate(makeCtx(5, 7, 'PATCH'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies when user missing', async () => {
    await expect(guard.canActivate(makeCtx(undefined, 1, 'PATCH'))).rejects.toBeInstanceOf(ForbiddenException);
  });
});
