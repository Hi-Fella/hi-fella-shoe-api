import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

// Custom validator for phone number validation
@ValidatorConstraint({ name: 'isPhoneNumberValid', async: false })
export class IsPhoneNumberValidConstraint
  implements ValidatorConstraintInterface
{
  validate(phoneNumber: string, args: ValidationArguments) {
    if (!phoneNumber) return false;

    // Get phone_code from the object
    const phoneCode = (args.object as any)[args.constraints[0]] as string;

    if (!phoneCode) return false;

    // Check if phone_number contains only numbers
    if (!/^\d+$/.test(phoneNumber)) return false;

    // Check total length (phone_code without + and phone_number)
    const phoneCodeWithoutPlus = phoneCode.replace('+', '');
    const totalLength = phoneCodeWithoutPlus.length + phoneNumber.length;

    // Check if total length is between 5 and 15 characters
    return totalLength >= 5 && totalLength <= 15;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number and phone code combined must be between 5 and 15 characters';
  }
}

export function IsPhoneNumberValid(phoneCodeProperty: string) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: {},
      constraints: [phoneCodeProperty],
      validator: IsPhoneNumberValidConstraint,
    });
  };
}
