import { IsBoolean, IsNumberString, IsOptional } from 'class-validator';

export class UpdateWinnerDto {
  @IsBoolean()
  confirmed!: boolean;

  @IsBoolean()
  notified!: boolean;

  @IsNumberString()
  @IsOptional()
  prizeValue!: string;

  @IsBoolean()
  primary!: boolean;
}
