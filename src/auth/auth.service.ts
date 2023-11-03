import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../entities/auth.entity';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthController.name);
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async login(userDto: UsersAuthDto): Promise<{ accessToken: string; refreshToken: string; actionToken: string }> {
    const user = await this.validateUser(userDto.email, userDto.password);
    let auth = await this.authRepository.findOne({ where: { userEmail: user.email } });
    if (!auth) {
      const { accessToken, refreshToken, actionToken } = await this.generateTokens(user.email);
      auth = this.authRepository.create({
        accessToken: accessToken,
        refreshToken: refreshToken,
        actionToken: actionToken,
        userEmail: user.email,
      });
    } else {
      const { accessToken, refreshToken, actionToken } = await this.generateTokens(user.email);
      auth.accessToken = accessToken;
      auth.refreshToken = refreshToken;
      auth.actionToken = actionToken;
    }
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${user.email}`);
    return this.generateTokens(user.email);
  }

  async loginAuth0(email: string): Promise<{ accessToken: string; refreshToken: string; actionToken: string }> {
    let auth = await this.authRepository.findOne({ where: { userEmail: email } });
    if (!auth) {
      const { accessToken, refreshToken, actionToken } = await this.generateTokens(email);
      auth = this.authRepository.create({
        accessToken: accessToken,
        refreshToken: refreshToken,
        actionToken: actionToken,
        userEmail: email,
      });
    } else {
      const { accessToken, refreshToken, actionToken } = await this.generateTokens(email);
      auth.accessToken = accessToken;
      auth.refreshToken = refreshToken;
      auth.actionToken = actionToken;
    }
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${email}`);
    return this.generateTokens(email);
  }

  private async generateTokens(
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string; actionToken: string }> {
    const payload = { userEmail: email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '24h' });
    const actionToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { accessToken: accessToken, refreshToken: refreshToken, actionToken: actionToken };
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

  async refreshTokens(refreshToken: string): Promise<{ access_token: string; refreshToken: string }> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken);
      const { userEmail } = payload;
      const user = await this.userRepository.findOne({ where: { email: userEmail } });
      if (user) {
        const newAccessToken = this.jwtService.sign({ userEmail });
        const newRefreshToken = this.jwtService.sign({ userEmail }, { expiresIn: '120h' });
        await this.authRepository.update({ userEmail }, { refreshToken: newRefreshToken });
        return { access_token: newAccessToken, refreshToken: newRefreshToken };
      }
    } catch (error) {
      this.logger.error(`Error refreshing tokens: ${error.message}`);
      throw new UnauthorizedException('Invalid refreshToken');
    }
  }
}
