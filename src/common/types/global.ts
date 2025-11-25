import { AzureBlobStorageService } from '@/azure-blob-storage/azure-blob-storage.service';

declare global {
  function dd(...items: any[]): never;
  interface Function {
    __filename?: string;
  }
  function assetStorage(path: string): Promise<string>;
  function assetExists(path: string): Promise<boolean>;
}

// Holder for the NestJS service instance
let azureBlobService: AzureBlobStorageService;

/**
 * Initialize the global helper with the NestJS service instance
 */
export function initBlobAzureStorage(service: AzureBlobStorageService) {
  azureBlobService = service;

  // attach global function
  global.assetStorage = async (path: string) =>
    (await assetExists(path)) ? azureBlobService.getFileUrl(path) : '';
  global.assetExists = async (path: string) =>
    // azure will throw error if it empty string
    !path || path.trim() === '' ? false : azureBlobService.isFileExists(path);
}

export {};
