import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

// Ensures every error - validation, not found, forbidden, unexpected -
// comes back in the same { message, statusCode } shape. The frontend's
// apiClient.js interceptor already expects error.response.data.message.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      (typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : null) ||
      (exception instanceof Error ? exception.message : 'Unexpected server error');

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
    });
  }
}
