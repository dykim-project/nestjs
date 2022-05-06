import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    NotFoundException,
    BadRequestException,
    ServiceUnavailableException,
    InternalServerErrorException,
    Res,
  } from '@nestjs/common';
  import { HttpAdapterHost } from '@nestjs/core';
  import { logger } from '../config/winston';
import { ProcessException } from './process.exception';
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  
    catch(exception: unknown, host: ArgumentsHost): void {
      // In certain situations `httpAdapter` might not be available in the
      // constructor method, thus we should resolve it here.

      const { httpAdapter } = this.httpAdapterHost;
      const ctx = host.switchToHttp();
      let httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      let resultMessage = httpStatus === 500 ? 'server Error' : '잘못된 요청입니다' ;
        if(exception instanceof HttpException){
            logger.error(`[http exception]`);
            logger.error(exception.getResponse());
            if(exception.message) {
              let res:any = exception.getResponse();
              resultMessage = `${exception.name} - ${exception.message} :`; 
              //dao validation chk message 
               if(res.message) {
                 resultMessage = res.message[0];
              } 
            } 

            //결제 중 오류인경우 front에서 message 그대로 보여줌 
            if(exception instanceof ProcessException) {
              resultMessage = exception.message;
              httpStatus = 200;
            }

            // if(exception instanceof BadRequestException) {
            //   resultMessage = `잘못된 요청입니다`;
            // }
          }
        

      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        resultMessage: resultMessage
      };
  
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
  