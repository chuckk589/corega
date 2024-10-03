import { Locale, User } from 'src/modules/mikroorm/entities/User';

export class RetrieveUserDto {
  constructor(user: User) {
    this.id = user.id.toString();
    this.chatId = user.chatId;
    this.username = user.username;
    this.locale = user.locale;
    this.role = user.role;
    this.phone = user.phone;
    this.createdAt = user.createdAt;
    this.city = user.city?.id.toString() || '';
    this.registered = user.registered;
    // this.passport = user.passport;
    // this.address = user.address;
    this.credentials = user.credentials;
  }
  id: string;
  chatId: string;
  username: string;
  locale: string;
  role: string;
  phone: string;
  registered: boolean;
  city: string;
  // passport: string;
  credentials: string;
  // address: string;
  createdAt: Date;
}
