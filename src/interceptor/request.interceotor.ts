import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../config/winston';
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    let request = context.switchToHttp().getRequest();
    logger.info('request::env::' + process.env.NODE_ENV);
    logger.info(`[start request url] ${request.url}` );
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>  logger.info(`[end request url] ${request.url}` )),
      );
  }
}