import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'System health check & infrastructure status' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  async getHealth() {
    return this.healthService.checkHealth();
  }
}
