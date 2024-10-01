import { IsString, IsNumberString, IsDateString, IsUrl, IsNotEmpty, IsOptional, IsBooleanString, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  buttons?: string;

  @IsDateString()
  @IsOptional()
  start?: string;

  @IsBooleanString()
  registeredOnly?: string;

  @IsBooleanString()
  checkOwnersOnly?: string;

  @IsOptional()
  @IsString()
  templateKey?: string;
}
