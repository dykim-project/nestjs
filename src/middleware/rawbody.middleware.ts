import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class rawbodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.body = JSON.parse(req.body);
    next();
  }
}