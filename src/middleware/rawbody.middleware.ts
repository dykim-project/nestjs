import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '@nestjs/common';
import { logger } from '../config/winston';
@Injectable()
export class RawbodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      logger.warn(`rawbody ${process.env.NODE_ENV}`);
      if( req.method !== 'GET') {
        req.body = JSON.parse(req.body);
      }
    } catch(error) {
       logger.warn('[middleware] parsing error');
      throw new BadRequestException();
    }
      next();
  }
}

