import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ApprovalAction, ApprovalCallbackDto } from './dto/approval.dto';
import { TopicStatus } from '@prisma/client';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const topics = await this.prisma.topicVideo.findMany({
      orderBy: { createdAt: 'desc' },
      include: { channel: true },
    });

    return {
      success: true,
      count: topics.length,
      data: topics.map((t) => ({
        id: t.id,
        channel_id: t.channelId,
        channel_name: t.channel?.name,
        title: t.title,
        category: t.category,
        historical_period: t.historicalPeriod || undefined,
        potential_score: t.potentialScore.toFixed(2),
        status: t.status,
        cloudinary_url: t.cloudinaryUrl || undefined,
        youtube_video_id: t.youtubeVideoId || undefined,
        youtube_url: t.youtubeUrl || undefined,
        duration_sec: t.durationSec || undefined,
        style_adherence_score: t.styleAdherenceScore || undefined,
        created_at: t.createdAt.toISOString(),
      })),
    };
  }

  async findOne(id: string) {
    const topic = await this.prisma.topicVideo.findUnique({
      where: { id },
      include: { channel: true, productionRuns: true },
    });

    if (!topic) {
      throw new NotFoundException(`Topic ${id} not found`);
    }

    return {
      id: topic.id,
      channel_id: topic.channelId,
      channel_name: topic.channel?.name,
      title: topic.title,
      category: topic.category,
      historical_period: topic.historicalPeriod,
      potential_score: topic.potentialScore,
      status: topic.status,
      cloudinary_url: topic.cloudinaryUrl,
      youtube_video_id: topic.youtubeVideoId,
      youtube_url: topic.youtubeUrl,
      duration_sec: topic.durationSec,
      style_adherence_score: topic.styleAdherenceScore,
      feedback: topic.feedback,
      qc_details: topic.qcDetails,
      created_at: topic.createdAt.toISOString(),
    };
  }

  async handleApproval(dto: ApprovalCallbackDto) {
    const topic = await this.prisma.topicVideo.findUnique({
      where: { id: dto.shortId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${dto.shortId} not found`);
    }

    if (dto.action === ApprovalAction.APPROVE) {
      const videoId = topic.youtubeVideoId || `yt_${Math.random().toString(36).substring(2, 11)}`;
      const youtubeUrl = `https://youtube.com/shorts/${videoId}`;

      await this.prisma.topicVideo.update({
        where: { id: dto.shortId },
        data: {
          status: TopicStatus.PUBLISHED,
          youtubeVideoId: videoId,
          youtubeUrl: youtubeUrl,
          feedback: dto.feedback || topic.feedback,
        },
      });

      return {
        success: true,
        action: 'PUBLISHED',
        videoId: videoId,
        youtubeUrl: youtubeUrl,
      };
    } else if (dto.action === ApprovalAction.REGENERATE) {
      await this.prisma.topicVideo.update({
        where: { id: dto.shortId },
        data: {
          status: TopicStatus.IDEA,
          feedback: dto.feedback || topic.feedback,
        },
      });

      return {
        success: true,
        action: 'IDEA',
      };
    } else if (dto.action === ApprovalAction.DISCARD) {
      await this.prisma.topicVideo.update({
        where: { id: dto.shortId },
        data: {
          status: TopicStatus.DISCARDED,
          feedback: dto.feedback || topic.feedback,
        },
      });

      return {
        success: true,
        action: 'DISCARD',
      };
    }
  }
}
