import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

export class BadRequestException extends HttpException {
  name: string;
  message: string;
  stack?: string;
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusMessage: '잘못된 요청입니다.2'
      });
  }
}