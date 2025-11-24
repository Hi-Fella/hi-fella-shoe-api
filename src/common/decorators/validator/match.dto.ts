import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      name: 'match',
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must match ${relatedPropertyName}`;
  }
}
