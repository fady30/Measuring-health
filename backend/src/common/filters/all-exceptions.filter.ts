import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = this.resolveStatus(exception);
    const body = this.buildBody(exception, status, request);

    this.logException(exception, status, request);

    response.status(status).json(body);
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildBody(
    exception: unknown,
    status: number,
    request: Request,
  ): ErrorResponseBody {
    return {
      statusCode: status,
      message: this.resolveMessage(exception, status),
      error: HttpStatus[status] ?? 'ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private resolveMessage(
    exception: unknown,
    status: number,
  ): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      const message = (response as { message?: string | string[] }).message;
      if (message !== undefined) {
        return message;
      }
      return exception.message;
    }
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Er is een interne fout opgetreden.';
    }
    return 'Er is een fout opgetreden.';
  }

  private logException(
    exception: unknown,
    status: number,
    request: Request,
  ): void {
    const reference = `${request.method} ${request.url}`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(reference, stack);
      return;
    }
    const detail =
      exception instanceof Error ? exception.message : 'Onbekende fout';
    this.logger.warn(`${reference} - ${detail}`);
  }
}
