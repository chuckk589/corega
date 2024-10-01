import { IsDateString, IsNumberString } from 'class-validator';

export class UpdateLotteryDto {
  @IsNumberString()
  status: string;

  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;
}
