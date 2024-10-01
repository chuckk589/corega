import { IsDate, IsDateString, IsNumberString } from 'class-validator';

export class CreateLotteryDto {
  @IsNumberString()
  primaryWinners: string;

  // @IsNumberString()
  reserveWinners: string;

  @IsNumberString()
  prize: string;

  @IsDateString()
  start: Date;

  @IsDateString()
  end: Date;
}
