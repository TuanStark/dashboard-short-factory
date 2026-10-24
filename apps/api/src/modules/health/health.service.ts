import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    let dbStatus = 'connected';
    let dbTime = new Date().toISOString();

    try {
      const result = await this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
      if (result && result.length > 0) {
        dbTime = result[0].now.toISOString();
      }
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      service: 'shorts-factory-worker',
      env: process.env.NODE_ENV || 'production',
      database: dbStatus,
      dbTime: dbTime,
      storage: {
        rendersExist: true,
      },
    };
  }
}
