import {Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private readonly configService: ConfigService, ) {
    super({
      domain: configService.get('AUTH0_DOMAIN'),
      clientID: configService.get('AUTH0_CLIENT_ID'),
      clientSecret: configService.get('AUTH0_CLIENT_SECRET'),
      callbackURL: configService.get('AUTHO_CALLBACK'),
      state: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    if (!profile || !profile.emails || profile.emails.length === 0) {
      throw new UnauthorizedException('Invalid profile data from Auth0.');
    }
    return profile.emails[0].value;
  }
}
