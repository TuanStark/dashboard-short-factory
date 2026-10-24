import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PrivacyStatus } from '@prisma/client';

export class ProduceContentDto {
  @ApiProperty({ example: 'Bí quyết làm chủ cảm xúc của Marcus Aurelius' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'philosophy' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 45, default: 45 })
  @IsNumber()
  @Min(10)
  @Max(120)
  @IsOptional()
  targetDurationSec?: number = 45;
}

export class ProduceOptionsDto {
  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  publishYouTube?: boolean = false;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  uploadCloudinary?: boolean = true;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  purgeLocalAfterUpload?: boolean = true;

  @ApiPropertyOptional({ enum: PrivacyStatus, default: PrivacyStatus.unlisted })
  @IsEnum(PrivacyStatus)
  @IsOptional()
  privacyStatus?: PrivacyStatus = PrivacyStatus.unlisted;
}

export class ProduceRequestDto {
  @ApiProperty({ example: 'channel_03_stoic' })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({ type: ProduceContentDto })
  @ValidateNested()
  @Type(() => ProduceContentDto)
  @IsNotEmpty()
  content: ProduceContentDto;

  @ApiPropertyOptional({ type: ProduceOptionsDto })
  @ValidateNested()
  @Type(() => ProduceOptionsDto)
  @IsOptional()
  options?: ProduceOptionsDto = new ProduceOptionsDto();
}
