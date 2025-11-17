import {
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class DtoValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const fieldErrors = {};

        for (const err of errors) {
          if (err.constraints) {
            fieldErrors[err.property] = Object.values(err.constraints)[0];
          }
        }

        const firstError = Object.values(fieldErrors)[0];

        return new BadRequestException({
            code: 400,
            status: 'failed',
            message: firstError,
            data: null,
            field_errors: fieldErrors
        });
      },
    });
  }
}