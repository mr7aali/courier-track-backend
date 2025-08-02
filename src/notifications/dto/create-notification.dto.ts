import { IsString, IsEnum, IsOptional, IsObject } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  userId: string

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  message: string

  @ApiProperty({ enum: ["email", "sms", "push", "in_app"] })
  @IsEnum(["email", "sms", "push", "in_app"])
  type: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any
}
