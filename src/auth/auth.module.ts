import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategy/auth0.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { Auth } from './entities/auth.entity';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Auth]),
    JwtModule.register({
      secret: process.env.SECRET_KEY1,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Auth0Strategy, JwtStrategy],
})
export class AuthModule {}
