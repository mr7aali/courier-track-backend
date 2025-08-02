import { IsString, IsArray, IsOptional, IsEnum, IsPhoneNumber } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  userId: string

  @ApiProperty({ enum: ["bike", "car", "van", "truck"] })
  @IsEnum(["bike", "car", "van", "truck"])
  vehicleType: string

  @ApiProperty()
  @IsString()
  vehicleNumber: string

  @ApiProperty()
  @IsString()
  licenseNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  serviceAreas?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  emergencyContact?: string
}
