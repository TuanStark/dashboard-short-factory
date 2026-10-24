import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EncryptionService } from '../../common/security/encryption.service';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService, PrismaService, EncryptionService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
