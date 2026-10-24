import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('AI Shorts Factory Endpoints (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

  it('GET /health - should return infrastructure health status without authentication (Public)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('shorts-factory-worker');
    expect(res.body.database).toBe('connected');
    expect(res.body.storage.rendersExist).toBe(true);
  });

  it('GET /api/v2/channels - should reject unauthenticated request with 401 Unauthorized', async () => {
    await request(app.getHttpServer()).get('/api/v2/channels').expect(401);
  });

  it('POST /api/v2/auth/login - should authenticate admin and issue JWT token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v2/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@shortfactory.ai',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');

    authToken = res.body.accessToken;
  });

  it('POST /api/v2/auth/login - should reject invalid credentials with 401', async () => {
    await request(app.getHttpServer())
      .post('/api/v2/auth/login')
      .send({
        email: 'admin@shortfactory.ai',
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('GET /api/v2/channels - should return configured channels with Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v2/channels')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('has_credentials');
  });

  it('GET /api/v2/genres - should return Brand DNA genres with Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v2/genres')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const darkStoic = res.body.data.find((g: any) => g.id === 'dark_stoic');
    expect(darkStoic).toBeDefined();
    expect(darkStoic.tts_provider).toBe('msedge');
  });

  it('GET /api/topics - should return generated topic shorts with Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/topics')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/schedule - should return cron configuration with Bearer token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/schedule')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.schedule.enabled).toBe(true);
    expect(res.body.schedule.cronExpression).toBeDefined();
  });

  it('POST /api/v2/pipeline/produce - should execute pipeline and return production result with Bearer token', async () => {
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
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.content.title);
    expect(res.body.data.cloudinaryUrl).toContain('https://res.cloudinary.com/');
    expect(res.body.data.qcResult.overallStatus).toBe('PASS');
  });
});
