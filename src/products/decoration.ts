import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const products = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    request.body.name;
    return request.body;
  },
);