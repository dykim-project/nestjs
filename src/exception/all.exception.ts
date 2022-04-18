import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    NotFoundException,
  } from '@nestjs/common';
  import { HttpAdapterHost } from '@nestjs/core';
  import { logger } from '../config/winston';
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
    catch(exception: unknown, host: ArgumentsHost): void {
      // In certain situations `httpAdapter` might not be available in the
      // constructor method, thus we should resolve it here.
      const { httpAdapter } = this.httpAdapterHost;
  
      const ctx = host.switchToHttp();
  
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
     // logger.info(exception.get)
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        resultMessage: '잘못된 요청입니다 not found..'
      };
  
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
  