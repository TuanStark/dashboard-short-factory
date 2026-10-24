import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { GenresModule } from './modules/genres/genres.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ScheduleModule } from './modules/schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '../../.env'],
    }),
    HealthModule,
    ChannelsModule,
    GenresModule,
    PipelineModule,
    TopicsModule,
    ScheduleModule,
  ],
})
export class AppModule {}
