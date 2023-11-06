import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get<string>('AUTH0_URL', '')}.well-known/jwks.json`,
      }),
      audience: configService.get<string>('AUTH0_AUDIENCE', ''),
      issuer: configService.get<string>('AUTH0_URL', ''),
      algorithms: ['RS256'],
    });
  }

  public async validate(payload: { aud: string }): Promise<User> {
    const email = payload.aud[0];
    let userEntity = await this.userRepository.findOne({ where: { email } });
    if (!userEntity) {
      userEntity = this.userRepository.create({ email });
      await this.userRepository.save(userEntity);
    }
    console.log(userEntity);
    return userEntity;
  }
}
