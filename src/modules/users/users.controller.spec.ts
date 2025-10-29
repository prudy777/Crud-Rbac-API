// src/modules/users/users.controller.spec.ts

// ✅ 1) Mock the guard module BEFORE creating the testing module.
// Jest will hoist this and replace the IsMineGuard class that the controller decorates with.
jest.mock('../../common/guards/is-mine.guard', () => ({
  IsMineGuard: class {
    canActivate() {
      return true; // always allow for unit tests
    }
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Types used by controller
import type {
  LoginResponse,
  UserPayload,
} from './interfaces/users-login.interface';

// ---- Mock UsersService ------------------------------------
const mockUsersService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

// Narrowed request type (matches controller usage)
type AuthRequest = { user: UserPayload };

describe('UsersController', () => {
  let controller: UsersController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------- registerUser ---------------------------
  describe('registerUser', () => {
    it('should register new user', async () => {
      const dto = { email: 'test@user.com', name: 'Test User', password: 'pw' };
      const safeUser = { id: 1, email: dto.email, name: dto.name }; // no password
      mockUsersService.registerUser.mockResolvedValueOnce(safeUser);

      const result = await controller.registerUser(dto as any);
      expect(result).toEqual(safeUser);
      expect(mockUsersService.registerUser).toHaveBeenCalledWith(dto);
    });

    it('should throw if email already registered', async () => {
      const dto = { email: 'dup@user.com', name: 'Dup', password: 'pw' };
      mockUsersService.registerUser.mockRejectedValueOnce(new ConflictException());

      await expect(controller.registerUser(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw if required fields missing', async () => {
      mockUsersService.registerUser.mockRejectedValueOnce(
        new BadRequestException(),
      );

      // @ts-expect-error testing bad payload
      await expect(controller.registerUser(null)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ---------------- loginUser ------------------------------
  describe('loginUser', () => {
    it('should login user and return access token', async () => {
      const mockResp: LoginResponse = { access_token: 'jwt.token.here' };
      mockUsersService.loginUser.mockResolvedValueOnce(mockResp);

      const result = await controller.loginUser({
        email: 'some@user.com',
        password: 'pw',
      } as any);

      expect(result).toEqual(mockResp);
      expect(result.access_token).toBeDefined();
      expect(mockUsersService.loginUser).toHaveBeenCalled();
    });

    it('should throw if email is wrong', async () => {
      mockUsersService.loginUser.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.loginUser({ email: 'wrong@user.com', password: 'pw' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------- me -------------------------------------
  describe('me', () => {
    it('should return the user payload from request', () => {
      const payload: UserPayload = { sub: 42, email: 'me@x.com', name: 'Me' };
      const req: AuthRequest = { user: payload };

      const result = controller.me(req as any);
      expect(result).toEqual(payload);
    });
  });

  // ---------------- updateUser -----------------------------
  describe('updateUser', () => {
    it('should update user', async () => {
      const id = 10;
      const dto = { name: 'New Name' };
      const updated = { id, email: 'u@x.com', name: 'New Name' };
      mockUsersService.updateUser.mockResolvedValueOnce(updated);

      const result = await controller.updateUser(id as any, dto as any);
      expect(result).toEqual(updated);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(id, dto);
    });

    it('should throw NotFound when user does not exist', async () => {
      const id = 999;
      mockUsersService.updateUser.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.updateUser(id as any, { name: 'N/A' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------- deleteUser -----------------------------
  describe('deleteUser', () => {
    it('should delete user and return message', async () => {
      const id = 5;
      const msg = `User with id ${id} deleted`;
      mockUsersService.deleteUser.mockResolvedValueOnce(msg);

      const result = await controller.deleteUser(id as any);
      expect(result).toBe(msg);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(id);
    });

    it('should throw NotFound when user does not exist', async () => {
      const id = 404;
      mockUsersService.deleteUser.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.deleteUser(id as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
