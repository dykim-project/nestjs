import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Catch, ArgumentsHost, HttpException, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

export class ProcessException extends InternalServerErrorException {
  //objectOrError?: string | object | any, description?: string);
    constructor(object: Object, message: string) {
      super(object, message);
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
        statusCode: 502,
        statusMessage: '잘못된 요청입니다.'
      });
  }
}