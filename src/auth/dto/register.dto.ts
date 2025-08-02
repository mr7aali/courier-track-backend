/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ enum: ['customer', 'agent'] })
  @IsEnum(['customer', 'agent'])
  role: string;
}
