import {Injectable, Logger} from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name)
}
