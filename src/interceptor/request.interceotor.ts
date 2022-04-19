import { Injectable, NestInterceptor, ExecutionContext, CallHandler, NotFoundException, HttpException, NotAcceptableException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { BadRequestException } from 'src/exception/badRequest.exception';
import { logger } from '../config/winston';
@Injectable()
export class RequestInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    let req = context.switchToHttp().getRequest();
    logger.info(`[start request url] ${req.url}` );
    const now = Date.now();
    return next
      .handle()
      .pipe(
        map(data=> {
          return {data: data, statusCode: 200};
         }),
       
      );
  }
}