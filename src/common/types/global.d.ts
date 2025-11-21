declare global {
  function dd(...items: any[]): never;
  interface Function {
    __filename?: string;
  }
}

export {};
