import {Injectable, Logger} from '@nestjs/common';
import {AuthController} from "./auth.controller";

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthController.name)
}
