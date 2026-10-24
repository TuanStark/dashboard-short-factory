import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { ConfigureChannelDto } from './dto/configure-channel.dto';

@ApiTags('Channels')
@Controller('api/v2/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all configured YouTube channels' })
  @ApiResponse({ status: 200, description: 'Channels list returned' })
  async getChannels() {
    return this.channelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a specific channel' })
  async getChannel(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  @Post('configure')
  @ApiOperation({ summary: 'Configure or update channel and Google OAuth credentials' })
  @ApiResponse({ status: 200, description: 'Channel configured successfully' })
  async configureChannel(@Body() dto: ConfigureChannelDto) {
    return this.channelsService.configure(dto);
  }
}
