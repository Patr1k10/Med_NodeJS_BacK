import { Body, Controller, Get, Post, Req, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenResponse } from '../types/interface';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login1(@Body() userDto: UsersAuthDto): Promise<TokenResponse> {
    return this.authService.login(userDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Headers('authorization') authorizationHeader: string): Promise<User | null> {
    return await this.authService.validateUserByToken(authorizationHeader);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh-token')
  async refreshTokens(@Body('refreshToken') refreshToken: string): Promise<TokenResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  async loginAuth0(@Req() req): Promise<TokenResponse> {
    const email = req.user.email;
    return this.authService.loginAuth0(email);
  }
}
