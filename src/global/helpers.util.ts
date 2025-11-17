import dayjs from 'dayjs';

export function tgl(
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

// Attach to globalThis so it’s available globally
declare global {
  // extend global type
  var tgl: (
    value: string | number | Date | dayjs.Dayjs,
    format: string,
  ) => string;
}

globalThis.tgl = tgl;
