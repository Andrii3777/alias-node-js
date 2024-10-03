import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {AuthGuard} from "./gurards/auth.guard";

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).overrideGuard(AuthGuard).useValue({canActivate: jest.fn(() => true)}).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        password: 'test',
      };
      const result = { userId: 'testUserId' };

      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(await authController.register(createUserDto)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      const result = {
        message: 'User logged successfully.',
        data: {
          access_token: 'testAccessToken',
          refresh_token: 'testRefreshToken',
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginDto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should refresh the access token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'testRefreshToken',
      };
      const result = { access_token: 'newAccessToken' };

      jest.spyOn(authService, 'refresh').mockResolvedValue(result);

      expect(await authController.refresh(refreshTokenDto)).toEqual(result);
      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should logout the user with a valid authorization header', async () => {
      const request = { userId: 'testUserId' } as Request & { userId: string };
      const result = { message: 'User logged out successfully, refresh token deleted.' };

      jest.spyOn(authService, 'logout').mockResolvedValue(result);

      expect(await authController.logout(request)).toEqual(result);
      expect(authService.logout).toHaveBeenCalledWith('testUserId');
    });
  });
});
