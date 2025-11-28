import { Module } from '@nestjs/common';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'AZURE_BLOB_STORAGE_CLIENT',
      useFactory: (config: ConfigService) => {
        return BlobServiceClient.fromConnectionString(
          config.get<string>('AZURE_STORAGE_CONNECTION_STRING', ''),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'AZURE_BLOB_SAS_CREDENTIAL',
      useFactory: (config: ConfigService) => {
        return new StorageSharedKeyCredential(
          config.get<string>('AZURE_STORAGE_NAME', ''),
          config.get<string>('AZURE_STORAGE_KEY', ''),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'AZURE_BLOB_CONTAINER',
      useFactory: (config: ConfigService) =>
        config.get<string>('AZURE_STORAGE_CONTAINER', ''),
      inject: [ConfigService],
    },
    AzureBlobStorageService,
  ],
  exports: [AzureBlobStorageService],
})
export class AzureBlobStorageModule {}
