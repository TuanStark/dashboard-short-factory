import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PipelineService } from '../pipeline/pipeline.service';
import { TriggerScheduleDto } from './dto/trigger-schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelineService: PipelineService,
  ) {}

  async getSchedule() {
    let config = await this.prisma.scheduleConfig.findUnique({
      where: { id: 'default' },
      include: { lastExecutedChannel: true },
    });

    if (!config) {
      config = await this.prisma.scheduleConfig.create({
        data: {
          id: 'default',
          enabled: true,
          cronExpression: '30 11,18 * * *',
          timezone: 'America/New_York',
        },
        include: { lastExecutedChannel: true },
      });
    }

    const defaultSlots = [
      {
        name: 'US Lunch Break',
        timeEST: '11:30 AM EST',
        timeVN: '22:30 PM ICT',
        target: 'Tier-1 Midday Mobile Browsing',
      },
      {
        name: 'US Prime Time',
        timeEST: '06:30 PM EST',
        timeVN: '05:30 AM ICT (+1)',
        target: 'Tier-1 Evening Leisure & Commute',
      },
    ];

    return {
      success: true,
      schedule: {
        enabled: config.enabled,
        cronExpression: config.cronExpression,
        timezone: config.timezone,
        nextRun: config.nextRun?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
        lastExecutedChannel: config.lastExecutedChannelId,
        slots: defaultSlots,
        isCurrentlyRunning: config.isCurrentlyRunning,
        lastRunAt: config.lastRunAt?.toISOString() || null,
        lastRunResult: config.lastRunResult || null,
        channelTurnIndex: config.channelTurnIndex,
      },
    };
  }

  async trigger(dto: TriggerScheduleDto) {
    let targetChannelId = dto.channelId;

    if (!targetChannelId) {
      // Find next channel in rotation
      const channels = await this.prisma.channel.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
      if (channels.length > 0) {
        targetChannelId = channels[0].id;
      } else {
        targetChannelId = 'channel_01_paper';
      }
    }

    this.logger.log(`Triggering scheduled run for channel: ${targetChannelId}`);

    // Update running state
    await this.prisma.scheduleConfig.update({
      where: { id: 'default' },
      data: {
        isCurrentlyRunning: true,
        lastExecutedChannelId: targetChannelId,
      },
    });

    try {
      const prodResult = await this.pipelineService.produce({
        channelId: targetChannelId,
        content: {
          title: `Autonomous Batch Run - ${new Date().toLocaleDateString('en-US')}`,
          targetDurationSec: 45,
        },
        options: {
          publishYouTube: false,
          uploadCloudinary: true,
          purgeLocalAfterUpload: true,
        },
      });

      await this.prisma.scheduleConfig.update({
        where: { id: 'default' },
        data: {
          isCurrentlyRunning: false,
          lastRunAt: new Date(),
          lastRunResult: 'SUCCESS',
        },
      });

      return {
        success: true,
        message: `Scheduled production run completed for channel ${targetChannelId}.`,
        data: prodResult.data,
      };
    } catch (error) {
      await this.prisma.scheduleConfig.update({
        where: { id: 'default' },
        data: {
          isCurrentlyRunning: false,
          lastRunAt: new Date(),
          lastRunResult: `FAILED: ${(error as Error).message}`,
        },
      });
      throw error;
    }
  }
}
