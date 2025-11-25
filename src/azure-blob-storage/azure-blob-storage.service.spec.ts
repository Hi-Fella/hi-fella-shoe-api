import { Test, TestingModule } from '@nestjs/testing';
import { AzureBlobStorageService } from './azure-blob-storage.service';

describe('AzureBlobStorageService', () => {
  let service: AzureBlobStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AzureBlobStorageService],
    }).compile();

    service = module.get<AzureBlobStorageService>(AzureBlobStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
