import { IsObject, IsOptional } from 'class-validator';

class LocaleDto {
  [key: string]: string;
}
export class UpdateLocaleDto {
  @IsObject()
  @IsOptional()
  ru?: LocaleDto;

  @IsObject()
  @IsOptional()
  uz?: LocaleDto;
}
