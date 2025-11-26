import { Transform } from 'class-transformer';

export function TransformEmptyToUndefined() {
  return Transform(({ value }) => {
    if (!value || typeof value !== 'string') return undefined;
    return value.trim().length <= 0 ? undefined : value;
  });
}
