import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateCheckDto {
  @IsString()
  @IsNotEmpty()
  credentials: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsNumberString()
  @IsNotEmpty()
  cardNumber: string;

  @IsNumberString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  pinfl: string;
}
