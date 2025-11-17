export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function add(a: number, b: number): number {
  return a + b;
}

// Attach to globalThis so it’s available globally
declare global {
  // extend global type
  var randomString: (length?: number) => string;
  var add: (a: number, b: number) => number;
}

globalThis.randomString = randomString;
globalThis.add = add;