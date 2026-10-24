import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REGENERATE = 'REGENERATE',
  DISCARD = 'DISCARD',
}

export class ApprovalCallbackDto {
  @ApiProperty({ example: 'e0b240b3-d345-4e38-951c-32b00517ba65' })
  @IsString()
  @IsNotEmpty()
  shortId: string;

  @ApiProperty({ enum: ApprovalAction, example: ApprovalAction.APPROVE })
  @IsEnum(ApprovalAction)
  @IsNotEmpty()
  action: ApprovalAction;

  @ApiPropertyOptional({ example: 'Kịch bản và hình ảnh rất đạt, chuyển sang chế độ Public' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
