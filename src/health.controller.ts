import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { IHealthCheck } from './types/interface';

@Controller('/health')
export class HealthController {
  private readonly logger: Logger = new Logger(HealthController.name);
  @Get()
  async healthCheck(): Promise<IHealthCheck> {
    this.logger.log('healthCheck');
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }
}
