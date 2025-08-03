import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['string', 'number', 'boolean', 'json'] })
  @IsOptional()
  @IsEnum(['string', 'number', 'boolean', 'json'])
  type?: string;

  @ApiPropertyOptional({ enum: ['system', 'user', 'admin', 'pricing'] })
  @IsOptional()
  @IsEnum(['system', 'user', 'admin', 'pricing'])
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
