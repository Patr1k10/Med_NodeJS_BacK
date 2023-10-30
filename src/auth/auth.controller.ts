import {Body, Controller, Get, Headers, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {UsersAuthDto} from "../users/dto/users.auth.dto";
import {AuthGuard} from "@nestjs/passport";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  async login1(@Body() userDto: UsersAuthDto) {
    const { access_token } = await this.authService.login(userDto);
    return { access_token };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Headers('authorization') authorizationHeader: string) {
    return await this.authService.validateUserByToken(authorizationHeader);
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  async login() {
  }

  @Get('callback')
  @UseGuards(AuthGuard('auth0'))
  async callback(@Req() req: Request) {
    console.log('Access Token:', req);
  }
}