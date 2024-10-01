import { IsNumberString, IsString, ValidateIf } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  object!: string;

  @IsNumberString()
  @ValidateIf((o) => o.userId === undefined)
  chatId?: string;

  @IsNumberString()
  @ValidateIf((o) => o.chatId === undefined)
  userId?: string;
}
