import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  systemPromptScriptwriter?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  visualStylePrompt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  visualNegativePrompt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ttsProvider?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ttsVoiceId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  soundscapePreset?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  motionEnginePreset?: string;
}
