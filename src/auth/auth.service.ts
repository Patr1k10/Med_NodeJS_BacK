import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {AuthController} from "./auth.controller";
import * as crypto from 'crypto';
import {JwtService} from "@nestjs/jwt";
import {Repository} from "typeorm";
import {User} from "../entities/user.entity";
import {UsersAuthDto} from "../users/dto/users.auth.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Auth} from "../entities/auth.entity";

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthController.name)
  constructor(private readonly jwtService: JwtService,
              @InjectRepository(User)
              private readonly userRepository: Repository<User>,
              @InjectRepository(Auth)
              private readonly authRepository: Repository<Auth>,) {
  }

  async login(userDto: UsersAuthDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(userDto.email, userDto.password);
    if (!user) {
      this.logger.error('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.email };
    const accessToken = this.jwtService.sign(payload);
    const auth =  this.authRepository.create({accessToken: accessToken, userEmail: user.email});
    await this.authRepository.save(auth)
    this.logger.log(`User logged in: ${user.email}`);

    return { access_token: accessToken };
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
    const user = await this.userRepository.findOne({where: {email}});
    if (user && await this.comparePasswords(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }


}



