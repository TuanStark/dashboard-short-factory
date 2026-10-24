import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('AI Shorts Factory Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health - should return infrastructure health status', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('shorts-factory-worker');
    expect(res.body.database).toBe('connected');
    expect(res.body.storage.rendersExist).toBe(true);
  });

  it('GET /api/v2/channels - should return configured channels', async () => {
    const res = await request(app.getHttpServer()).get('/api/v2/channels').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('has_credentials');
  });

  it('GET /api/v2/genres - should return Brand DNA genres', async () => {
    const res = await request(app.getHttpServer()).get('/api/v2/genres').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const darkStoic = res.body.data.find((g: any) => g.id === 'dark_stoic');
    expect(darkStoic).toBeDefined();
    expect(darkStoic.tts_provider).toBe('msedge');
  });

  it('GET /api/topics - should return generated topic shorts', async () => {
    const res = await request(app.getHttpServer()).get('/api/topics').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/schedule - should return cron configuration', async () => {
    const res = await request(app.getHttpServer()).get('/api/schedule').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.schedule.enabled).toBe(true);
    expect(res.body.schedule.cronExpression).toBeDefined();
  });

  it('POST /api/v2/pipeline/produce - should execute pipeline and return production result', async () => {
    const payload = {
      channelId: 'channel_03_stoic',
      content: {
        title: 'Bí quyết làm chủ cảm xúc của Marcus Aurelius',
        category: 'dark_stoic',
        targetDurationSec: 45,
      },
      options: {
        publishYouTube: false,
        uploadCloudinary: true,
        purgeLocalAfterUpload: true,
      },
    };

    const res = await request(app.getHttpServer())
      .post('/api/v2/pipeline/produce')
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.content.title);
    expect(res.body.data.cloudinaryUrl).toContain('https://res.cloudinary.com/');
    expect(res.body.data.qcResult.overallStatus).toBe('PASS');
  });
});
