import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, HttpException } from '@nestjs/common';
import { map, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from './api.response.dto';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      catchError((error) => {
        // Обработка ошибок
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        return throwError(() => {
          throw new HttpException(
            {
              status_code: status,
              detail: error.message || null,
              result: 'error',
            },
            status,
          );
        });
      }),
      map((data) => {
        return {
          status_code: HttpStatus.OK,
          detail: data,
          result: 'success',
        };
      }),
    );
  }
}
