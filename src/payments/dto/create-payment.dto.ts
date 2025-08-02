import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  parcelId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['cod', 'prepaid', 'online'] })
  @IsEnum(['cod', 'prepaid', 'online'])
  paymentType: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}
