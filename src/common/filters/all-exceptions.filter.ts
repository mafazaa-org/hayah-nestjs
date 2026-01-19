import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * @Catch(): Registers this filter to catch all exceptions. @Catch() without args catches all.
 * implements ExceptionFilter: Must implement catch(exception, host)
 * private readonly logger = new Logger(AllExceptionsFilter.name): Logger instance using the class name for context
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * @param exception: unknown: Handles any exception type
   * @param host: ArgumentsHost: The arguments host
   * @returns void
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // switchToHttp(): Switches to HTTP context
    const ctx = host.switchToHttp();
    // getResponse<Response>(): Gets Express response
    const response = ctx.getResponse<Response>();
    // getRequest<Request>(): Gets Express request
    const request = ctx.getRequest<Request>();

    // If HttpException: uses getStatus() (e.g., 400, 404, 500).
    // Otherwise: INTERNAL_SERVER_ERROR (500)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // If HttpException: uses getResponse() (string or object)
    // Otherwise: 'Internal server error'
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Create error response object
    const errorResponse = {
      // statusCode: HTTP status code
      statusCode: status,

      // timestamp: ISO timestamp of when the error occurred
      timestamp: new Date().toISOString(),

      // path: Request URL path
      path: request.url,

      // method: HTTP method (GET, POST, etc.)
      method: request.method,

      // message: Normalizes message:
      // If string, use as-is
      // If object, extract message (string or array), otherwise use the whole object
      message:
        typeof message === 'string'
          ? message
          : (message as { message?: string | string[] }).message || message,
    };

    // Log the exception
    // First arg: Context (method + URL)
    // Second arg: Stack trace if Error, else JSON stringified exception
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Send response with status (HTTP status code) and error response (JSON body)
    response.status(status).json(errorResponse);
  }
}