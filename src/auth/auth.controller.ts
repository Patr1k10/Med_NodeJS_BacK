import { Body, Controller, Post } from '@nestjs/common';
import {AuthService} from "./auth.service";
import {UsersAuthDto} from "../users/dto/users.auth.dto";




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('login')
  async login(@Body() userDto: UsersAuthDto) {
    const { access_token } = await this.authService.login(userDto);
    return { access_token };
  }
}
