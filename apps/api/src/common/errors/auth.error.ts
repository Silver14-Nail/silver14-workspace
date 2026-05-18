import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedError extends HttpException {
  constructor(
    response: string | Record<string, any> = 'Unauthorized',
    status: number = HttpStatus.UNAUTHORIZED,
  ) {
    super(response, status);
  }
}
