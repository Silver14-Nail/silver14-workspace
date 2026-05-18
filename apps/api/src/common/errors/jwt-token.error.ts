import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTokenError extends HttpException {
  constructor(
    response: string | Record<string, any> = 'Invalid Token',
    status: number = HttpStatus.UNAUTHORIZED,
  ) {
    super(response, status);
  }
}

export class TokenExpiredError extends HttpException {
  constructor(
    response: string | Record<string, any> = 'Token Expired',
    status: number = HttpStatus.BAD_REQUEST,
  ) {
    super(response, status);
  }
}
