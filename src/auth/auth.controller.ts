import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersAuthDto } from '../users/dto/users.auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login1(@Body() userDto: UsersAuthDto) {
    const { access_token } = await this.authService.login(userDto);
    return { access_token };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Headers('authorization') authorizationHeader: string) {
    return await this.authService.validateUserByToken(authorizationHeader);
  }

  @Post('refresh-token')
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    const { access_token, refreshToken: newRefreshToken } = await this.authService.refreshTokens(refreshToken);
    return { access_token, refreshToken: newRefreshToken };
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  async loginAuth0(@Req() req) {
    const email = req.user.email;
    return this.authService.loginAuth0(email);
  }
}
