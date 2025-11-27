import dayjs from 'dayjs';

export function formatDate(
  value: string | number | Date | dayjs.Dayjs,
  format: string,
): string {
  // placed if used later
  const timezone = 'Asia/Jakarta';

  if (format == 'iso_time') {
    // Dayjs instance
    if (dayjs.isDayjs(value)) {
      return value.toISOString();
    }

    // Native Date / Number timestamp / String date
    if (
      value instanceof Date ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      const d = dayjs(value);
      return d.isValid() ? d.toISOString() : '';
    }

    return '';
  }

  try {
    return dayjs(value).format(format);
  } catch (error) {
    return '';
  }
}

export function capitalizeFirstLetter(s: string) {
  return s && String(s[0]).toUpperCase() + String(s).slice(1);
}

export function numberToColumnLetter(num: number): string {
  let letter = '';
  while (num > 0) {
    const mod = (num - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

export function formatMoney(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Rp -';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

export function findMinimumBigInt(arr: bigint[]): bigint {
  if (arr.length === 0) return BigInt(0);
  return arr.reduce((min, current) => (current < min ? current : min));
}

// Attach to globalThis so it's available globally
declare global {
  // extend global type
  var formatDate: (
    value: string | number | Date | dayjs.Dayjs,
    format: string,
  ) => string;
  var capitalizeFirstLetter: (s: string) => string;
  var numberToColumnLetter: (num: number) => string;
  var formatMoney: (amount: number | string) => string;
  var findMinimumBigInt: (arr: bigint[]) => bigint;
}

globalThis.formatDate = formatDate;
globalThis.capitalizeFirstLetter = capitalizeFirstLetter;
globalThis.numberToColumnLetter = numberToColumnLetter;
globalThis.formatMoney = formatMoney;
globalThis.findMinimumBigInt = findMinimumBigInt;
