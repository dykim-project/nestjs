import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '@nestjs/common';
import { logger } from '../config/winston';
@Injectable()
export class RawbodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info(`rawbody ${process.env.NODE_ENV}`);
      console.log(req.body);
      console.log(req.url);
      if( req.method !== 'GET' && req.url != '/payment/resultNicePay' && req.url != '/ncpay') {
        req.body = JSON.parse(req.body);
      }
    } catch(error) {
       logger.warn('[middleware] parsing error');
      throw new BadRequestException();
    }
      next();
  }
}

