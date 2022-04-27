import { Injectable, NestInterceptor, ExecutionContext, CallHandler, NotFoundException, HttpException, NotAcceptableException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { logger } from '../config/winston';
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    let req = context.switchToHttp().getRequest();
    logger.info(`[start request url] ${req.url}` );
    return next
      .handle()
      .pipe(
        tap(()=> `[end request utl] ${req.url}`)
      );
  }
}