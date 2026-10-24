import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsService } from './channels.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EncryptionService } from '../../common/security/encryption.service';
import { PrivacyStatus } from '@prisma/client';

describe('ChannelsService', () => {
  let service: ChannelsService;
  let mockPrisma: any;
  let mockEncryption: any;

  beforeEach(async () => {
    mockPrisma = {
      channel: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'channel_01_paper',
            name: 'Paper Theater World (History)',
            genreKey: 'paper_history',
            genre: { name: 'Paper Theater Ancient History' },
            description: 'Ancient history papercraft',
            defaultPrivacy: PrivacyStatus.unlisted,
            defaultTags: ['history'],
            isActive: true,
            credentials: { id: 'cred_1' },
            createdAt: new Date('2026-01-01T00:00:00Z'),
          },
        ]),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      genreProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'paper_history' }),
      },
      googleCredential: {
        upsert: jest.fn(),
      },
    };

    mockEncryption = {
      encrypt: jest.fn().mockReturnValue('encrypted_token_mock'),
      decrypt: jest.fn().mockReturnValue('decrypted_token_mock'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
  });

  it('should list channels and format has_credentials accurately without exposing tokens', async () => {
    const result = await service.findAll();
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(result.data[0].id).toBe('channel_01_paper');
    expect(result.data[0].has_credentials).toBe(true);
    expect(result.data[0]).not.toHaveProperty('clientSecret');
    expect(result.data[0]).not.toHaveProperty('refreshToken');
  });

  it('should encrypt credentials during channel configure', async () => {
    await service.configure({
      id: 'channel_04_mystery',
      name: 'Midnight Paradox',
      genreKey: 'paper_history',
      credentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        refreshToken: 'test-refresh',
      },
    });

    expect(mockEncryption.encrypt).toHaveBeenCalledWith('test-secret');
    expect(mockEncryption.encrypt).toHaveBeenCalledWith('test-refresh');
    expect(mockPrisma.channel.upsert).toHaveBeenCalled();
    expect(mockPrisma.googleCredential.upsert).toHaveBeenCalled();
  });
});
