/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';


export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    const user = request.user as User;
    return data ? user[data] : user;
  },
);
