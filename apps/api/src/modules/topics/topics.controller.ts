import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { ApprovalCallbackDto } from './dto/approval.dto';

@ApiTags('Topics & HITL Approval')
@Controller()
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get(['api/topics', 'api/v2/topics'])
  @ApiOperation({ summary: 'List generated video topics and viral potential scores' })
  @ApiResponse({ status: 200, description: 'Topics list returned' })
  async getTopics() {
    return this.topicsService.findAll();
  }

  @Get(['api/topics/:id', 'api/v2/topics/:id'])
  @ApiOperation({ summary: 'Get single topic details' })
  async getTopic(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Post(['api/approval/callback', 'api/v2/approval/callback'])
  @ApiOperation({ summary: 'Human-in-the-Loop review callback (APPROVE, REGENERATE, DISCARD)' })
  @ApiResponse({ status: 200, description: 'Approval processed' })
  async handleApproval(@Body() dto: ApprovalCallbackDto) {
    return this.topicsService.handleApproval(dto);
  }
}
