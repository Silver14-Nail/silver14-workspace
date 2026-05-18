import { Request } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { UnauthorizedError } from '@/common/errors/auth.error';

export type PassedAuthMiddlewareRequest<R extends Request = Request> = R & {
  user: {
    id: string;
  };
};

@Injectable()
export class UserApiMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    try {
      next();
    } catch (error) {
      throw new UnauthorizedError(error);
    }
  }
}
