import { Request } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

import { AuthService } from '@/shared/auth/auth.service';
import { UnauthorizedError } from '@/common/errors/auth.error';

export type PassedAuthMiddlewareRequest<R extends Request = Request> = R & {
  user: {
    id: string;
  };
};

@Injectable()
export class AdminApiMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const user = await this.authService.validateRequest(req);
      req.user = {
        id: user.id,
      };
      next();
    } catch (error) {
      throw new UnauthorizedError(error);
    }
  }
}
