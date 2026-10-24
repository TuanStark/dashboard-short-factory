import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TriggerScheduleDto {
  @ApiPropertyOptional({ example: 'channel_02_tech' })
  @IsString()
  @IsOptional()
  channelId?: string;
}
