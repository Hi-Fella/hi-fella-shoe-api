import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

// Custom validator for age validation
@ValidatorConstraint({ name: 'isAgeValid', async: false })
export class IsAgeValidConstraint implements ValidatorConstraintInterface {
  validate(birthDate: string) {
    if (!birthDate) return false;

    const date = new Date(birthDate);
    const today = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) return false;

    // Calculate age
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    // Check if age is between 10 and 120 years
    return age >= 10 && age <= 120;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Age must be between 10 and 120 years';
  }
}

export function IsAgeValid() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: {},
      constraints: [],
      validator: IsAgeValidConstraint,
    });
  };
}
