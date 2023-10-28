import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "../entities/user.entity";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import * as dotenv from 'dotenv';
import {Auth} from "../entities/auth.entity";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";

dotenv.config();

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Auth]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '12h' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

})
export class AuthModule {}
