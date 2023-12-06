import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { mockUser } from '../common/const/mock.user';
import { mockRepository } from '../common/const/mock.repository';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let authRepository: Repository<Auth>;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should generate tokens and save them to Auth entity', async () => {
      const userDto = { email: 'mock@example.com', password: 'mockPassword' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      jest.spyOn(authService as any, 'comparePasswords').mockResolvedValue(true);

      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      jest.spyOn(authService as any, 'generateTokens').mockReturnValue({
        newAccessToken: 'token',
        newRefreshToken: 'token',
        newActionToken: 'token',
      });

      const result = await authService.login(userDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: userDto.email } });
      expect(authService as any).toHaveProperty('comparePasswords');
      expect(authService as any).toHaveProperty('generateTokens');
      expect(authRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ newAccessToken: 'token', newRefreshToken: 'token', newActionToken: 'token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const userDto = { email: 'test@example.com', password: 'password' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(authService.login(userDto)).rejects.toThrowError(UnauthorizedException);
    });
  });
  describe('loginAuth0', () => {
    it('should generate tokens, create a new Auth entity, and save it when user does not exist', async () => {
      const email = 'test@example.com';

      jest.spyOn(authRepository, 'findOne').mockResolvedValue(null);

      const generateTokensSpy = jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
        newAccessToken: 'token',
        newRefreshToken: 'token',
        newActionToken: 'token',
      });

      await authService.loginAuth0(email);

      expect(authRepository.findOne).toHaveBeenCalledWith({ where: { userEmail: email } });
      expect(generateTokensSpy).toHaveBeenCalledWith(email);
      expect(authRepository.create).toHaveBeenCalledWith({
        accessToken: 'token',
        refreshToken: 'token',
        actionToken: 'token',
        userEmail: email,
      });
      expect(authRepository.save).toHaveBeenCalled();
    });

    it('should update tokens and save the existing Auth entity when user exists', async () => {
      const email = 'test@example.com';
      const existingAuth = new Auth();

      jest.spyOn(authRepository, 'findOne').mockResolvedValue(existingAuth);

      const generateTokensSpy = jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
        newAccessToken: 'newToken',
        newRefreshToken: 'newToken',
        newActionToken: 'newToken',
      });

      await authService.loginAuth0(email);

      expect(authRepository.findOne).toHaveBeenCalledWith({ where: { userEmail: email } });
      expect(generateTokensSpy).toHaveBeenCalledWith(email);
      expect(existingAuth.accessToken).toBe('newToken');
      expect(existingAuth.refreshToken).toBe('newToken');
      expect(existingAuth.actionToken).toBe('newToken');
      expect(authRepository.save).toHaveBeenCalledWith(existingAuth);
    });
  });
  describe('validateUserByToken', () => {
    it('should return user when a valid token is provided', async () => {
      // Arrange
      const validToken = 'validToken';
      const authorizationHeader = `Bearer ${validToken}`;
      const userEmail = 'mock@example.com';
      const user = new User();
      user.email = userEmail;

      jest.spyOn(jwtService, 'verify').mockReturnValue({ userEmail });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      // Act
      const result = await authService.validateUserByToken(authorizationHeader);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: userEmail } });
      expect(result).toEqual(user);
    });

    it('should return null when an invalid token is provided', async () => {
      // Arrange
      const invalidToken = 'invalidToken';
      const authorizationHeader = `Bearer ${invalidToken}`;

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await authService.validateUserByToken(authorizationHeader);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(invalidToken);
      expect(result).toBeNull();
    });

    it('should return null and log an error when an exception occurs during token validation', async () => {
      // Arrange
      const invalidToken = 'invalidToken';
      const authorizationHeader = `Bearer ${invalidToken}`;
      const errorMessage = 'Token validation error';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Act
      const result = await authService.validateUserByToken(authorizationHeader);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(invalidToken);

      expect(result).toBeNull();
    });
  });
  describe('refreshTokens', () => {
    it('should refresh tokens and return the new tokens when a valid refresh token is provided', async () => {
      const validRefreshToken = 'validRefreshToken';
      const userEmail = 'mock@example.com';
      const user = new User();
      user.email = userEmail;

      const newAccessToken = 'newAccessToken';
      const newRefreshToken = 'newRefreshToken';
      const newActionToken = 'newActionToken';

      const authServiceSpy = jest.spyOn(authService as any, 'generateTokens').mockResolvedValue({
        newAccessToken,
        newRefreshToken,
        newActionToken,
      });

      const jwtServiceVerifySpy = jest.spyOn(jwtService, 'verify').mockReturnValue({ userEmail });

      const userRepositoryFindOneSpy = jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const authRepositoryUpdateSpy = jest.spyOn(authRepository, 'update');

      const result = await authService.refreshTokens(validRefreshToken);

      expect(jwtServiceVerifySpy).toHaveBeenCalledWith(validRefreshToken);
      expect(userRepositoryFindOneSpy).toHaveBeenCalledWith({ where: { email: userEmail } });
      expect(authServiceSpy).toHaveBeenCalledWith(userEmail);
      expect(authRepositoryUpdateSpy).toHaveBeenCalledWith(
        { userEmail },
        { accessToken: newAccessToken, refreshToken: newRefreshToken, actionToken: newActionToken },
      );
      expect(result).toEqual({ newAccessToken, newRefreshToken, newActionToken });
    });

    it('should throw UnauthorizedException and log an error when an invalid refresh token is provided', async () => {
      const invalidRefreshToken = 'invalidRefreshToken';
      const errorMessage = 'Invalid refresh token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await expect(authService.refreshTokens(invalidRefreshToken)).rejects.toThrowError(UnauthorizedException);
    });
  });
});
