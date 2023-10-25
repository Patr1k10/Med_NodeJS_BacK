import { Controller, Get, HttpStatus } from '@nestjs/common';
import {IHealthCheck} from "./interface/health..heckResponse.interface";

@Controller()
export class HealthController {
  private readonly logger: Logger = new Logger(HealthController.name)
  @Get()
  async healthCheck(): Promise<IHealthCheck> {
    this.logger.log('healthCheck')
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }
}
