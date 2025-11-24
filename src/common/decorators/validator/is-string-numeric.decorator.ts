import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

// Custom validator for string numeric validation
@ValidatorConstraint({ name: 'isStringNumeric', async: false })
export class IsStringNumericConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value !== 'string') return false;

    // Allow empty string or check if string contains only numeric characters
    return value === '' || /^\d+$/.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only numeric characters`;
  }
}

export function IsStringNumeric() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      name: 'isStringNumeric',
      options: {},
      constraints: [],
      validator: IsStringNumericConstraint,
    });
  };
}
