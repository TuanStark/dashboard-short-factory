import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EncryptionService } from '../../common/security/encryption.service';
import { ConfigureChannelDto } from './dto/configure-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findAll() {
    const channels = await this.prisma.channel.findMany({
      include: {
        genre: true,
        credentials: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      count: channels.length,
      data: channels.map((ch) => ({
        id: ch.id,
        name: ch.name,
        genre_key: ch.genreKey,
        genre_name: ch.genre?.name,
        description: ch.description,
        default_privacy: ch.defaultPrivacy,
        default_tags: ch.defaultTags,
        is_active: ch.isActive,
        has_credentials: Boolean(ch.credentials),
        created_at: ch.createdAt.toISOString(),
      })),
    };
  }

  async findOne(id: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
      include: {
        genre: true,
        credentials: { select: { id: true } },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    return {
      id: channel.id,
      name: channel.name,
      genre_key: channel.genreKey,
      genre_name: channel.genre?.name,
      description: channel.description,
      default_privacy: channel.defaultPrivacy,
      default_tags: channel.defaultTags,
      is_active: channel.isActive,
      has_credentials: Boolean(channel.credentials),
      created_at: channel.createdAt.toISOString(),
    };
  }

  async configure(dto: ConfigureChannelDto) {
    // 1. Ensure genre exists
    const genre = await this.prisma.genreProfile.findUnique({
      where: { id: dto.genreKey },
    });
    if (!genre) {
      // Auto-create a minimal genre fallback if not exists
      await this.prisma.genreProfile.create({
        data: {
          id: dto.genreKey,
          name: dto.genreKey,
          description: `Auto-generated profile for ${dto.genreKey}`,
          systemPromptScriptwriter: 'Default director prompt',
          visualStylePrompt: 'Default visual prompt',
          visualNegativePrompt: 'cartoon, blurry',
          ttsVoiceId: 'en-US-AndrewNeural',
          soundscapePreset: 'default_ambient',
          motionEnginePreset: 'default_push',
        },
      });
    }

    // 2. Upsert Channel
    await this.prisma.channel.upsert({
      where: { id: dto.id },
      update: {
        name: dto.name,
        genreKey: dto.genreKey,
        description: dto.description,
        defaultPrivacy: dto.defaultPrivacy,
        defaultTags: dto.defaultTags,
        isActive: dto.isActive,
      },
      create: {
        id: dto.id,
        name: dto.name,
        genreKey: dto.genreKey,
        description: dto.description,
        defaultPrivacy: dto.defaultPrivacy,
        defaultTags: dto.defaultTags,
        isActive: dto.isActive,
      },
    });

    // 3. Encrypt and store OAuth credentials if provided
    if (dto.credentials) {
      const encryptedSecret = this.encryptionService.encrypt(dto.credentials.clientSecret);
      const encryptedRefreshToken = this.encryptionService.encrypt(dto.credentials.refreshToken);

      await this.prisma.googleCredential.upsert({
        where: { channelId: dto.id },
        update: {
          clientId: dto.credentials.clientId,
          clientSecretEncrypted: encryptedSecret,
          refreshTokenEncrypted: encryptedRefreshToken,
        },
        create: {
          channelId: dto.id,
          clientId: dto.credentials.clientId,
          clientSecretEncrypted: encryptedSecret,
          refreshTokenEncrypted: encryptedRefreshToken,
        },
      });
    }

    return {
      success: true,
      message: `Channel ${dto.id} configured successfully.`,
    };
  }
}
