import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Global Validation Pipe with automatic transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 3. Centralized Exception Filter & Logging
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 4. OpenAPI / Swagger Documentation with Bearer Auth
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Shorts Factory REST API')
    .setDescription(
      'Technical specification and interactive OpenAPI playground for AI Shorts Factory v2.0 Control Plane.',
    )
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication, user credentials, and session identity')
    .addTag('Channels', 'Manage YouTube channels & credentials')
    .addTag('Genres', 'Artistic style DNA & AGY prompt directives')
    .addTag('Production Pipeline', 'Trigger single and batch video rendering')
    .addTag('Topics & HITL Approval', 'Review viral topics & approve for YouTube')
    .addTag('Auto-Scheduler', 'Autonomous production cron matrix')
    .addTag('Health', 'Infrastructure health & storage availability')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Port resolution via ConfigService
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4001;
  await app.listen(port);
  logger.log(`🚀 AI Shorts Factory API server is running on: http://localhost:${port}`);
  logger.log(`📚 OpenAPI Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
