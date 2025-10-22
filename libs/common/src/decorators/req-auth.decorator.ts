// libs/common/src/decorators/req-auth.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Express.User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
