import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {UsersAuthDto} from "../users/dto/users.auth.dto";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../decorator/getUser.decorator";
import {User} from "../entities/user.entity";

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
  async getProfile(@GetUser() user: User) {
    return user
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  async login() {}

  @Get('callback')
  @UseGuards(AuthGuard('auth0'))
  async callback() {}
}