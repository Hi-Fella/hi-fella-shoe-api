import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class InternalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private config: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Log the exception
    this.logger.error(
      `${request.method} ${request.url} - ${exception.message}`,
      exception.stack,
    );

    // If it's a BadRequestException from DtoValidationPipe, use its custom response format
    if (exception instanceof HttpException && exception.getStatus() === 400) {
      const exceptionResponse = exception.getResponse();

      // Check if this is our custom validation error response
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse &&
        'status' in exceptionResponse
      ) {
        return response.status(400).json(exceptionResponse);
      }
    }

    // If it's a Unauthorized exception , use its custom response format
    if (exception instanceof HttpException && exception.getStatus() === 401) {
      const exceptionResponse = exception.getResponse();

      // Check if this is our custom validation error response
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse &&
        'status' in exceptionResponse
      ) {
        return response.status(401).json(exceptionResponse);
      }
    }

    // If it's already a known HTTP exception, allow default behavior
    if (
      exception instanceof InternalServerErrorException === false &&
      exception instanceof HttpException === false &&
      exception.status
    ) {
      return response.status(exception.status).json(exception.getResponse());
    }

    var error_message = {
      code: 500,
      status: 'failed',
      message: 'Internal server error',
      data: null,
    };
    if (
      exception instanceof InternalServerErrorException ||
      !exception.status
    ) {
      if (this.config.get<string>('APP_ENV') == 'local') {
        error_message = Object.assign(error_message, {
          msg: exception?.message ?? 'Unhandled exception',
        });
      }
    } else {
      // HTTP Exception
      error_message = {
        code: exception.status,
        status: 'failed',
        message: exception.message ?? 'Unhandled exception',
        data: null,
      };
    }

    // CUSTOM 500 RESPONSE
    response.status(error_message.code).json(error_message);
  }
}
