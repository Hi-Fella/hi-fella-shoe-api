import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

function isValidBigInt(value: string): boolean {
  if (!/^-?\d+$/.test(value)) return false; // Check it's a valid number string

  try {
    const num = BigInt(value);
    return num >= -9223372036854775808n && num <= 9223372036854775807n;
  } catch {
    return false;
  }
}

// Custom validator for string numeric validation
@ValidatorConstraint({ name: 'isStringNumeric', async: false })
export class IsStringNumericConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value !== 'string') return false;

    // Allow empty string
    if (value === '') return true;

    // Check if string contains only numeric characters
    if (!/^\d+$/.test(value)) return false;

    // Check if the length exceeds BigInt maximum safe length
    return isValidBigInt(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only numeric characters and not exceed 1000 characters`;
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
