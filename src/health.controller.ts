import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  healthCheck():IHealthCheck {
    return {
      status_code: 200,
      detail: 'ok',
      result: 'working',
    };
  }
}
