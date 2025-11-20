import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

// Custom validator for password validation
@ValidatorConstraint({ name: 'isPasswordValid', async: false })
export class IsPasswordValidConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password) return false;

    // Check minimum length of 8 characters
    if (password.length < 8) return false;

    // Check for at least 1 uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // Check for at least 1 number
    if (!/\d/.test(password)) return false;

    // Check for at least 1 special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character';
  }
}

export function IsPasswordValid() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: {},
      constraints: [],
      validator: IsPasswordValidConstraint,
    });
  };
}
