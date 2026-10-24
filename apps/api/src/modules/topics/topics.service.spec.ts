import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { ApprovalAction } from './dto/approval.dto';
import { TopicStatus } from '@prisma/client';

describe('TopicsService', () => {
  let service: TopicsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      topicVideo: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'topic_1',
            channelId: 'channel_01_paper',
            channel: { name: 'Paper History' },
            title: 'Test Topic Title',
            category: 'history',
            potentialScore: 9.8,
            status: TopicStatus.PUBLISHED,
            createdAt: new Date('2026-01-01T00:00:00Z'),
          },
        ]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'topic_1',
          channelId: 'channel_01_paper',
          title: 'Test Topic Title',
          status: TopicStatus.READY_FOR_REVIEW,
          youtubeVideoId: 'existing_yt_id',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
  });

  it('should list topics and format potential_score as string decimal', async () => {
    const result = await service.findAll();
    expect(result.success).toBe(true);
    expect(result.data[0].potential_score).toBe('9.80');
    expect(result.data[0].status).toBe('PUBLISHED');
  });

  it('should transition topic to PUBLISHED upon APPROVE action', async () => {
    const res = await service.handleApproval({
      shortId: 'topic_1',
      action: ApprovalAction.APPROVE,
      feedback: 'Approved for public release',
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe('PUBLISHED');
    expect(res.youtubeUrl).toContain('https://youtube.com/shorts/');
    expect(mockPrisma.topicVideo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'topic_1' },
        data: expect.objectContaining({ status: TopicStatus.PUBLISHED }),
      }),
    );
  });

  it('should transition topic back to IDEA upon REGENERATE action', async () => {
    const res = await service.handleApproval({
      shortId: 'topic_1',
      action: ApprovalAction.REGENERATE,
      feedback: 'Script needs more hook tension',
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe('IDEA');
    expect(mockPrisma.topicVideo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'topic_1' },
        data: expect.objectContaining({ status: TopicStatus.IDEA }),
      }),
    );
  });
});
