import { Module } from 'module';

const dtoFileMap = new Map<Function | string, string>();
let isInterceptorInstalled = false;

export function installDtoRequireInterceptor() {
  if (isInterceptorInstalled) {
    console.log('[DTO Tracker] Interceptor already installed');
    return;
  }

  // Store original require
  const originalRequire = Module.prototype.require;

  // Override Module.prototype.require
  Module.prototype.require = function (id: string) {
    // Call the original require to load the module
    const loadedModule = originalRequire.apply(this, arguments as any);

    // Check if this is a DTO file
    if (id.includes('.dto')) {
      const fileName = extractFileName(id);

      // Track all exported DTO classes
      if (loadedModule && typeof loadedModule === 'object') {
        Object.keys(loadedModule).forEach((key) => {
          const exportedItem = loadedModule[key];

          // Check if it's a class
          if (typeof exportedItem === 'function' && exportedItem.name) {
            dtoFileMap.set(exportedItem.name, fileName); // store by class name string
            exportedItem.__filename = fileName;
            // console.log(`[DTO Tracker] ${exportedItem.name} -> ${fileName}`);
          }
        });
      }
    }

    return loadedModule;
  } as any;

  isInterceptorInstalled = true;
  console.log('[DTO Tracker] Require interceptor installed successfully');
}

function extractFileName(modulePath: string): string {
  // Extract file name from path
  // Examples:
  // './dtos/user.dto' -> 'user'
  // '../user.dto.ts' -> 'user'
  // '/absolute/path/user.dto.js' -> 'user'

  const parts = modulePath.split('/');
  const fileName = parts[parts.length - 1];

  return fileName
    .replace(/\.dto\.ts$/, '')
    .replace(/\.dto\.js$/, '')
    .replace(/\.dto$/, '');
}

export function getDtoFileName(target: any): string {
  // Try to get by constructor
  if (target?.constructor) {
    const fileName =
      dtoFileMap.get(target.constructor) ||
      dtoFileMap.get(target.constructor.name);
    if (fileName) return fileName;
  }

  // Try to get by class name string
  if (typeof target === 'string') {
    return dtoFileMap.get(target) || 'unknown';
  }

  // Try to get by function
  if (typeof target === 'function') {
    return dtoFileMap.get(target) || dtoFileMap.get(target.name) || 'unknown';
  }

  return 'unknown';
}

// Debug helper
export function listTrackedDtos(): void {
  console.log('\n=== Tracked DTOs ===');
  const entries = Array.from(dtoFileMap.entries());
  entries.forEach(([key, value]) => {
    const name = typeof key === 'function' ? key.name : key;
    console.log(`${name} -> ${value}`);
  });
  console.log(`Total: ${entries.length}\n`);
}
