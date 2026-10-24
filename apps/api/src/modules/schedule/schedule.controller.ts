import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { TriggerScheduleDto } from './dto/trigger-schedule.dto';

@ApiTags('Auto-Scheduler')
@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(['api/schedule', 'api/v2/schedule'])
  @ApiOperation({ summary: 'Get automated production cron schedule and current rotation state' })
  @ApiResponse({ status: 200, description: 'Schedule details returned' })
  async getSchedule() {
    return this.scheduleService.getSchedule();
  }

  @Post(['api/v2/schedule/trigger', 'api/schedule/trigger'])
  @ApiOperation({ summary: 'Trigger next channel or specified channel in production rotation' })
  @ApiResponse({ status: 200, description: 'Scheduled production run triggered' })
  async triggerSchedule(@Body() dto: TriggerScheduleDto) {
    return this.scheduleService.trigger(dto);
  }
}
