import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

interface ErrorResponseBody {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
  path: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errorCode } = this.resolveException(exception);

    const body: ErrorResponseBody = {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${status}: ${message}`);
    }

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string;
    errorCode: string;
  } {
    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as any;
      const raw = res?.message;
      const message = Array.isArray(raw) ? raw.join('; ') : raw ?? exception.message;
      return { status: 400, message, errorCode: 'VALIDATION_ERROR' };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const raw = typeof res === 'string' ? res : (res as any)?.message ?? exception.message;
      const message = Array.isArray(raw) ? raw.join('; ') : raw;
      return { status, message, errorCode: `HTTP_${status}` };
    }

    if (exception instanceof QueryFailedError) {
      const err = exception as any;
      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this value already exists.',
          errorCode: 'DB_DUPLICATE_ENTRY',
        };
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A database error occurred. Please try again.',
        errorCode: 'DB_QUERY_FAILED',
      };
    }

    if (exception instanceof EntityNotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'The requested resource was not found.',
        errorCode: 'DB_ENTITY_NOT_FOUND',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      errorCode: 'INTERNAL_SERVER_ERROR',
    };
  }
}
