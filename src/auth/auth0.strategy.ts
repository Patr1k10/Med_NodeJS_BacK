import {Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import {ConfigService} from "@nestjs/config";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../entities/user.entity";
import {Repository} from "typeorm";
import {AuthService} from "./auth.service";

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private readonly configService: ConfigService,
              @InjectRepository(User)
              private readonly userRepository: Repository<User>,
              private readonly authService: AuthService) {
    super({
      domain: configService.get('AUTH0_DOMAIN'),
      clientID: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_SECRET'),
      callbackURL: configService.get('AUTHO_CALLBACK'),
      state: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    if (!profile || !profile.emails || profile.emails.length === 0) {
      throw new UnauthorizedException('Invalid profile data from Auth0.');
    }
    const email = profile.emails[0].value;
    const existingUser = await this.userRepository.findOne( {where:{ email }});
    if (!existingUser) {
      const newUser = this.userRepository.create({
        email: email
      });
      await this.userRepository.save(newUser);

      return this.authService.loginAuth0(email);
    }
    return this.authService.loginAuth0(email);
  }
}
