export interface TxOptions {
  typeorm?: string[]; // array of TypeORM connection names
  mongoose?: string[]; // array of Mongoose connection names
}

export function Transactional(options: TxOptions = { typeorm: ['default'] }) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('tx:options', options, descriptor.value);
  };
}
