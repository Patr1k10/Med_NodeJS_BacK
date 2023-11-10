import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { ConfigService } from '@nestjs/config';
import { TokenResponse } from '../types/interface';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthController.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async login(userDto: UsersAuthDto): Promise<TokenResponse> {
    const user = await this.validateUser(userDto.email, userDto.password);
    let auth = await this.authRepository.findOne({ where: { userEmail: user.email } });
    if (!auth) {
      const { newAccessToken, newRefreshToken, newActionToken } = await this.generateTokens(user.email);
      auth = this.authRepository.create({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        actionToken: newActionToken,
        userEmail: user.email,
      });
    } else {
      const { newAccessToken, newRefreshToken, newActionToken } = await this.generateTokens(user.email);
      auth.accessToken = newAccessToken;
      auth.refreshToken = newRefreshToken;
      auth.actionToken = newActionToken;
    }
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${user.email}`);
    return this.generateTokens(user.email);
  }

  async loginAuth0(email: string): Promise<TokenResponse> {
    let auth = await this.authRepository.findOne({ where: { userEmail: email } });
    if (!auth) {
      const { newAccessToken, newRefreshToken, newActionToken } = await this.generateTokens(email);
      auth = this.authRepository.create({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        actionToken: newActionToken,
        userEmail: email,
      });
    } else {
      const { newAccessToken, newRefreshToken, newActionToken } = await this.generateTokens(email);
      auth.accessToken = newAccessToken;
      auth.refreshToken = newRefreshToken;
      auth.actionToken = newActionToken;
    }
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${email}`);
    return this.generateTokens(email);
  }

  private async generateTokens(email: string): Promise<TokenResponse> {
    const payload = { userEmail: email };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get<string>('SECRET_KEY1'),
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('SECRET_KEY2'),
    });
    const newActionToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get<string>('SECRET_KEY3'),
    });

    return { newAccessToken, newRefreshToken, newActionToken };
  }

  private async comparePasswords(password: string, userPasswordHash: string): Promise<boolean> {
    try {
      const [salt, userHash] = userPasswordHash.split(':');
      const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return userHash === derivedKey;
    } catch (error) {
      this.logger.error(`Error comparing passwords: ${error.message}`);
      throw error;
    }
  }

  private async validateUser(email: string, password: string): Promise<UsersAuthDto | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  async validateUserByToken(authorizationHeader: string): Promise<User | null> {
    try {
      const token = authorizationHeader.split(' ')[1];
      const payload: JwtPayload = this.jwtService.verify(token);
      const { userEmail } = payload;
      return await this.userRepository.findOne({ where: { email: userEmail } });
    } catch (error) {
      this.logger.error(`Error validating token: ${error.message}`);
      return null;
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken);
      const { userEmail } = payload;
      const user = await this.userRepository.findOne({ where: { email: userEmail } });
      if (user) {
        const { newAccessToken, newRefreshToken, newActionToken } = await this.generateTokens(userEmail);
        await this.authRepository.update(
          { userEmail },
          { accessToken: newAccessToken, refreshToken: newRefreshToken, actionToken: newActionToken },
        );
        return { newAccessToken, newRefreshToken, newActionToken };
      }
    } catch (error) {
      this.logger.error(`Error refreshing tokens: ${error.message}`);
      throw new UnauthorizedException('Invalid refreshToken');
    }
  }
}
