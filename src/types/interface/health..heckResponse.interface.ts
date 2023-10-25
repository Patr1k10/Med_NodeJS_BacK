import {HttpStatus} from "@nestjs/common";

export interface IHealthCheck {
  status_code: HttpStatus.OK;
  detail: string;
  result: string;
}