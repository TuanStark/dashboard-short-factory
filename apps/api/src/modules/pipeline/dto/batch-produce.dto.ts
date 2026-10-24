import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BatchItemContentDto {
  @ApiProperty({ example: 'Sự trỗi dậy của Robot hình người 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class BatchItemOptionsDto {
  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  publishYouTube?: boolean = false;
}

export class BatchItemDto {
  @ApiProperty({ example: 'channel_02_tech' })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({ type: BatchItemContentDto })
  @ValidateNested()
  @Type(() => BatchItemContentDto)
  @IsNotEmpty()
  content: BatchItemContentDto;

  @ApiPropertyOptional({ type: BatchItemOptionsDto })
  @ValidateNested()
  @Type(() => BatchItemOptionsDto)
  @IsOptional()
  options?: BatchItemOptionsDto;
}

export class BatchProduceRequestDto {
  @ApiProperty({ type: [BatchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];
}
