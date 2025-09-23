import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entity/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return data ? user[data] : user;
  },
);
