import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsDateString, IsPhoneNumber } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateParcelDto {
  @ApiProperty()
  @IsString()
  recipientName: string

  @ApiProperty()
  @IsPhoneNumber()
  recipientPhone: string

  @ApiProperty()
  @IsString()
  pickupAddress: string

  @ApiProperty()
  @IsString()
  deliveryAddress: string

  @ApiProperty({ enum: ["small", "medium", "large", "extra_large"] })
  @IsEnum(["small", "medium", "large", "extra_large"])
  parcelSize: string

  @ApiProperty({ enum: ["document", "package", "fragile", "electronics", "clothing", "food", "other"] })
  @IsEnum(["document", "package", "fragile", "electronics", "clothing", "food", "other"])
  parcelType: string

  @ApiProperty()
  @IsNumber()
  weight: number

  @ApiProperty({ enum: ["cod", "prepaid"] })
  @IsEnum(["cod", "prepaid"])
  paymentType: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  codAmount?: number

  @ApiProperty()
  @IsNumber()
  deliveryFee: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledPickupDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDeliveryDate?: Date

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFragile?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialInstructions?: string
}
