import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PrivacyStatus } from '@prisma/client';

export class ChannelCredentialsDto {
  @ApiProperty({ description: 'Google Cloud OAuth Client ID' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Google Cloud OAuth Client Secret' })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({ description: 'Google OAuth2 Offline Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ConfigureChannelDto {
  @ApiProperty({ example: 'channel_04_mystery' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Midnight Paradox (Science Mystery)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cyberpunk_tech' })
  @IsString()
  @IsNotEmpty()
  genreKey: string;

  @ApiPropertyOptional({ example: 'Unveiling mind-bending scientific paradoxes' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: PrivacyStatus, default: PrivacyStatus.unlisted })
  @IsEnum(PrivacyStatus)
  @IsOptional()
  defaultPrivacy?: PrivacyStatus = PrivacyStatus.unlisted;

  @ApiPropertyOptional({ example: ['science', 'paradox', 'shorts'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultTags?: string[] = [];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({ type: ChannelCredentialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelCredentialsDto)
  credentials?: ChannelCredentialsDto;
}
