import { Controller, Get, HttpStatus } from '@nestjs/common';
import {IHealthCheck} from "./types/interface/health..heckResponse.interface";

@Controller()
export class HealthController {
  @Get()
  async healthCheck(): Promise<IHealthCheck> {
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }
}
