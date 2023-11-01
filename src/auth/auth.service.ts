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

  async login(userDto: UsersAuthDto): Promise<{ access_token: string; refreshToken: string }> {
    const user = await this.validateUser(userDto.email, userDto.password);
    if (!user) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { userEmail: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '120h' });
    const auth = this.authRepository.create({
      accessToken: accessToken,
      refreshToken: refreshToken,
      userEmail: user.email,
    });
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${user.email}`);

    return { access_token: accessToken, refreshToken: refreshToken };
  }
  async loginAuth0(email: string): Promise<{ access_token: string; refreshToken: string }> {
    const payload = { userEmail: email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '120h' });
    const auth = this.authRepository.create({ accessToken: accessToken, refreshToken: refreshToken, userEmail: email });
    await this.authRepository.save(auth);
    this.logger.log(`User logged in: ${email}`);
    return { access_token: accessToken, refreshToken: refreshToken };
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
      throw new UnauthorizedException('Invalid refreshToken');
    } catch (error) {
      this.logger.error(`Error refreshing tokens: ${error.message}`);
      throw new UnauthorizedException('Invalid refreshToken');
    }
  }
}
