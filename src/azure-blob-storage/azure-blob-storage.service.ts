import { Inject, Injectable } from '@nestjs/common';
import {
  StorageSharedKeyCredential,
  BlobServiceClient,
  BlockBlobClient,
  SASProtocol,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AzureBlobStorageService {
  constructor(
    @Inject('AZURE_BLOB_STORAGE_CLIENT')
    private blobServiceClient: BlobServiceClient,
    @Inject('AZURE_BLOB_SAS_CREDENTIAL')
    private sasCredential: StorageSharedKeyCredential,
    @Inject('AZURE_BLOB_CONTAINER')
    private containerName: string,
  ) {}

  private getContainer() {
    return this.blobServiceClient.getContainerClient(this.containerName);
  }

  async uploadFile(buffer: Buffer, originalName: string) {
    const ext = originalName.split('.').pop() || '';
    const fileName = `${uuid()}.${ext}`;

    const container = this.getContainer();
    const blob: BlockBlobClient = container.getBlockBlobClient(fileName);

    await blob.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: this.getMime(ext) },
    });

    return {
      name: fileName,
      url: blob.url,
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    const container = this.getContainer();
    const blob = container.getBlobClient(filename);

    if (!(await blob.exists())) return false;

    await blob.delete();
    return true;
  }

  getFileUrl(path: string) {
    const url = this.getContainer().getBlobClient(path).url;
    const sas = this.generateSasUrl(path);
    return `${url}?${sas}`;
  }

  private generateSasUrl(path: string) {
    const sas = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: path,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes in ms
        protocol: SASProtocol.Https,
      },
      this.sasCredential,
    ).toString();

    return sas;
  }

  async isFileExists(path: string) {
    return this.getContainer().getBlobClient(path).exists();
  }

  private getMime(ext: string) {
    const types = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp4: 'video/mp4',
      pdf: 'application/pdf',
    };
    return types[ext] || 'application/octet-stream';
  }
}
