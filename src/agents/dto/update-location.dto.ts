import { IsNumber, IsOptional, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateLocationDto {
  @ApiProperty()
  @IsNumber()
  latitude: number

  @ApiProperty()
  @IsNumber()
  longitude: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string
}
