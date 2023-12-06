import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenResponse } from '../types/interface';
import { User } from '../users/entities/user.entity';
import { mockUser } from '../common/const/mock.user';

jest.mock('./auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      // Arrange
      const userDto: UsersAuthDto = { email: 'mock@example.com', password: 'mockPassword' };
      const tokenResponse: TokenResponse = {
        newAccessToken: 'token',
        newRefreshToken: 'token',
        newActionToken: 'token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(tokenResponse);

      // Act
      const result = await authController.login(userDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(tokenResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile on successful token validation', async () => {
      // Arrange
      const authorizationHeader = 'Bearer validToken';

      jest.spyOn(authService, 'validateUserByToken').mockResolvedValue(mockUser as User);

      // Act
      const result = await authController.getProfile(authorizationHeader);

      // Assert
      expect(authService.validateUserByToken).toHaveBeenCalledWith(authorizationHeader);
      expect(result).toEqual(mockUser as User);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens on successful token refresh', async () => {
      // Arrange
      const refreshToken = 'validRefreshToken';
      const tokenResponse: TokenResponse = {
        newAccessToken: 'newToken',
        newRefreshToken: 'newToken',
        newActionToken: 'newToken',
      };

      jest.spyOn(authService, 'refreshTokens').mockResolvedValue(tokenResponse);

      // Act
      const result = await authController.refreshTokens('validRefreshToken' as any);

      // Assert
      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(tokenResponse);
    });
  });

  describe('loginAuth0', () => {
    it('should return tokens on successful Auth0 login', async () => {
      // Arrange
      const req = { user: { email: 'test@example.com' } };
      const tokenResponse: TokenResponse = {
        newAccessToken: 'token',
        newRefreshToken: 'token',
        newActionToken: 'token',
      };

      jest.spyOn(authService, 'loginAuth0').mockResolvedValue(tokenResponse);

      // Act
      const result = await authController.loginAuth0(req);

      // Assert
      expect(authService.loginAuth0).toHaveBeenCalledWith(req.user.email);
      expect(result).toEqual(tokenResponse);
    });
  });
});
