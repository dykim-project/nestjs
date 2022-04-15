import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from '../config/winston';
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('Before...');
    let request = context.switchToHttp().getRequest();
    try {
    request.body = JSON.parse(request.body);
    } catch {
      logger.error('parsing error');
       throw new BadRequestException('parsing error');
    }
    const now = Date.now();
    return next
      .handle()
      .pipe(
       // tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}