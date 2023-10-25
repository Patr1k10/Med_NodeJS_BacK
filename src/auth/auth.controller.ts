import {Controller, Logger} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name)
}
