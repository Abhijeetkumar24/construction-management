import { Injectable, NestInterceptor, ExecutionContext, BadGatewayException, CallHandler, NotFoundException, BadRequestException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    return next
      .handle()
      .pipe(
        catchError(err => {
            
          return throwError(() => err );
        }),
      );
  }
}
