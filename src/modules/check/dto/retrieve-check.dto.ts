import { Check } from 'src/modules/mikroorm/entities/Check';

export class RetrieveCheckDto {
  constructor(check: Check) {
    this.id = check.id.toString();
    this.fancyId = check.fancyId;
    this.credentials = check.user?.credentials || '';
    this.phone = check.user.phone;
    this.locale = check.user?.locale || '';
    this.createdAt = check.createdAt;
    this.status = check.status?.id.toString() || '';
    this.checkPath = check.checkPath;
    this.goodPath = check.goodPath;
    this.idPath = check.idPath;
    this.pinfl = check.pinfl;
    this.cardNumber = check.cardNumber;
  }
  id: string;
  fancyId: string;
  credentials: string;
  phone: string;
  status: string;
  locale: string;
  createdAt: Date;
  checkPath: string;
  goodPath: string;
  idPath: string;
  pinfl: string;
  cardNumber: string;
}
