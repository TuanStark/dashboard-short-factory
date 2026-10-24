import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ScheduleService } from './schedule.service';
import { TriggerScheduleDto } from './dto/trigger-schedule.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Auto-Scheduler')
@ApiBearerAuth('JWT-auth')
@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(['api/schedule', 'api/v2/schedule'])
  @ApiOperation({ summary: 'Get automated production cron schedule and current rotation state' })
  @ApiResponse({ status: 200, description: 'Schedule details returned' })
  async getSchedule() {
    return this.scheduleService.getSchedule();
  }

  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @Post(['api/v2/schedule/trigger', 'api/schedule/trigger'])
  @ApiOperation({ summary: 'Trigger next channel or specified channel in production rotation' })
  @ApiResponse({ status: 200, description: 'Scheduled production run triggered' })
  async triggerSchedule(@Body() dto: TriggerScheduleDto) {
    return this.scheduleService.trigger(dto);
  }
}
