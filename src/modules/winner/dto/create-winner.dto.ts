import { IsBoolean, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateWinnerDto {
  // @IsBoolean()
  // primary!: boolean;

  @IsString()
  fancyId!: string;

  // @IsNumberString()
  // @IsOptional()
  // sharesWith?: string;
}
