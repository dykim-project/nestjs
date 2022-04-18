import { NotFoundException } from '@nestjs/common';
import { Catch, ArgumentsHost, HttpException, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError } from 'rxjs';

@Catch(NotFoundException)
export class BadRequestException extends HttpException {
    constructor() {
      super('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
    }
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
        statusMessage: '잘못된 요청입니다.'
      });
  }
}