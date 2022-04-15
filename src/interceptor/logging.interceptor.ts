import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../config/winston';
import * as rawbody from 'raw-body';
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('Before...');
    let request = context.switchToHttp().getRequest();
    //const request = ctx.getRequest<Request>();
    logger.info(request.url);
    const raw = await rawbody(request.body);
    //request.body = JSON.parse(request.body);
    logger.info(":::",raw);
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}