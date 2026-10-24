import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const mockValidKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'ENCRYPTION_KEY') return mockValidKey;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly encrypt and decrypt a sensitive string', () => {
    const secret = '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-secret-12345';
    const encrypted = service.encrypt(secret);

    expect(encrypted).not.toEqual(secret);
    expect(encrypted.split(':').length).toEqual(3);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toEqual(secret);
  });

  it('should throw an error if cipher text has invalid format', () => {
    expect(() => service.decrypt('corrupted_string')).toThrow('Invalid ciphertext format');
  });
});
