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

  return '';
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

// Attach to globalThis so it’s available globally
declare global {
  // extend global type
  var formatDate: (
    value: string | number | Date | dayjs.Dayjs,
    format: string,
  ) => string;
  var capitalizeFirstLetter: (s: string) => string;
  var numberToColumnLetter: (num: number) => string;
}

globalThis.formatDate = formatDate;
globalThis.capitalizeFirstLetter = capitalizeFirstLetter;
globalThis.numberToColumnLetter = numberToColumnLetter;
