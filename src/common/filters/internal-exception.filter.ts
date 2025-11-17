import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class InternalExceptionFilter implements ExceptionFilter {
  constructor(private config: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

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
