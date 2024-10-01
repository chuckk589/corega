import { IsEnum, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Locale, UserRole } from 'src/modules/mikroorm/entities/User';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  credentials?: string;

  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  registered?: boolean;

  @IsOptional()
  @IsNumberString()
  promo?: string;
}
