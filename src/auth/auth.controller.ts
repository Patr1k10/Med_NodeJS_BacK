import { Body, Controller, Get, Post, Req, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../entities/user.entity';
import { AuthResponse, TokenResponse } from '../types/interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login1(@Body() userDto: UsersAuthDto): Promise<AuthResponse> {
    const { accessToken, refreshToken, actionToken } = await this.authService.login(userDto);
    return { accessToken, refreshToken, actionToken };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Headers('authorization') authorizationHeader: string): Promise<User | null> {
    return await this.authService.validateUserByToken(authorizationHeader);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh-token')
  async refreshTokens(@Body('refreshToken') refreshToken: string): Promise<TokenResponse> {
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  async loginAuth0(@Req() req): Promise<AuthResponse> {
    const email = req.user.email;
    return this.authService.loginAuth0(email);
  }
}
