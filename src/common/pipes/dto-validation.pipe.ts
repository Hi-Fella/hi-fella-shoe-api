import {
  Injectable,
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { getMetadataStorage } from 'class-validator';

@Injectable()
export class DtoValidationPipe extends ValidationPipe {
  constructor(private readonly i18n: I18nService) {
    super({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        // console.log('exceptionFactory', errors);
        const formattedErrors = this.formatErrors(errors);
        // if (formattedErrors) {
        //   console.log('formattedErrors', formattedErrors);
        // }

        const errorResponse = {
          code: 400,
          status: 'failed',
          message: Object.values(formattedErrors)[0] || '',
          data: null,
          field_errors: formattedErrors,
        };
        // console.log(errorResponse);
        return new BadRequestException(errorResponse);
      },
    });
  }

  private formatErrors(errors: ValidationError[]) {
    // console.log('errors aaaa', errors);
    const errorData = {};
    errors.forEach((error, index) => {
      // Get context from DTO class name instead of 'unknown'
      if (error.target && error.constraints) {
        const metadata = getMetadataStorage();
        const constructor = error.target.constructor;
        const property = error.property;
        const dtoName = constructor.name;
        // console.log('dtoName', dtoName);
        const fileName = constructor.__filename;
        // console.log('fileName', fileName);
        const firstKey = Object.keys(error.constraints)[0];
        const rules = metadata.getTargetValidationMetadatas(
          constructor,
          '',
          true,
          false,
        );
        // console.log('rules', rules);

        const rule = rules.find(
          (v) => v.propertyName === property && v.name === firstKey,
        );

        if (!rule) return {};

        // return all constraints dynamically
        const constraints = rule.constraints || [];
        // console.log('constraints', constraints);

        // // Auto-map constraint array to named keys
        // // Example: for MinLength(8) -> { constraint0: 8 }
        const obj = constraints.reduce(
          (acc, value, index) => {
            acc[`t${index}`] = value;
            return acc;
          },
          {} as Record<string, string>,
        );

        // constraints.forEach((c, index) => {
        //   mapped[fKey] = c;
        // });
        const info = {
          type: rule.type, // e.g., "minLength"
          property,
          constraints: obj, // e.g., { constraint0: 8 }
        };

        // console.log('info', info);

        // console.log('firstKey', firstKey);
        const path = `validation.${fileName}.${dtoName}.${property}.${firstKey}`;
        const tl = this.i18n.t(path, {
          args: info.constraints,
        });
        // console.log('testTL', path, tl);
        errorData[property] = tl;
      }
    });
    return errorData;
  }
}
