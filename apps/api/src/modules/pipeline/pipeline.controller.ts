import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { ProduceRequestDto } from './dto/produce.dto';
import { BatchProduceRequestDto } from './dto/batch-produce.dto';

@ApiTags('Production Pipeline')
@Controller('api/v2/pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Post('produce')
  @ApiOperation({ summary: 'Trigger single-channel video production pipeline' })
  @ApiResponse({ status: 200, description: 'Video produced and offloaded to Cloudinary' })
  async produceVideo(@Body() dto: ProduceRequestDto) {
    return this.pipelineService.produce(dto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Trigger batch video production matrix across multiple channels' })
  @ApiResponse({ status: 200, description: 'Batch jobs initiated and completed' })
  async produceBatch(@Body() dto: BatchProduceRequestDto) {
    return this.pipelineService.produceBatch(dto);
  }
}
