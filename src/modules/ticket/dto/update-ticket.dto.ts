import { IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  response!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  chatId?: number;

  @IsNumberString()
  @IsOptional()
  userId?: string;
}
