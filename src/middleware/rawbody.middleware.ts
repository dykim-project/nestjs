import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from 'src/exception/badRequest.exception';
import { logger } from '../config/winston';
@Injectable()
export class RawbodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      req.body = JSON.parse(req.body);
      } catch {
        logger.error('parsing error');
        throw new BadRequestException();
      }
      next();
  }
}