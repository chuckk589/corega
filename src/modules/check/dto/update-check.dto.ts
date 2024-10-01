import { IsNumberString } from 'class-validator';

export class UpdateCheckDto {
  @IsNumberString()
  status: string;
}
