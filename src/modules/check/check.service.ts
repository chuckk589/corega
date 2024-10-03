import { EntityManager } from '@mikro-orm/mysql';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Bot } from 'grammy';
import { BOT_NAME } from 'src/constants';
import { BotContext } from 'src/types/interfaces';
import i18n from '../bot/middleware/i18n';
import { Check } from '../mikroorm/entities/Check';
import { CheckState, CheckStatus } from '../mikroorm/entities/CheckStatus';
import { User } from '../mikroorm/entities/User';
import { RetrieveCheckDto } from './dto/retrieve-check.dto';
import { UpdateCheckDto } from './dto/update-check.dto';
import { LOCALES } from '../bot/common/constants';

export type ImportedCheck = {
  timestamp: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  marketing_optin: string;
  dob: string;
  address: string;
  barcode: string;
  town: string;
  country: string;
  created_at: string;
};

@Injectable()
export class CheckService {
  constructor(private readonly em: EntityManager, @Inject(BOT_NAME) private bot: Bot<BotContext>) {}

  async findAll(): Promise<RetrieveCheckDto[]> {
    return (await this.em.find(Check, {}, { populate: ['user', 'status.translation.values', 'status.comment.values'] })).map((check) => new RetrieveCheckDto(check));
  }
  // async parseChecksFile(buffer: any) {
  //   const workSheetsFromBuffer = xlsx.parse(buffer, { cellDates: true });
  //   //check for length (should be 2)

  //   const checkStatus = await this.em.findOneOrFail(CheckStatus, { name: CheckState.APPROVED });

  //   const statistics = {
  //     checks: {
  //       approved: 0,
  //       rejected: 0,
  //       total: 0,
  //     },
  //     barcodes: {
  //       approved: 0,
  //       rejected: 0,
  //       total: 0,
  //     },
  //   };
  //   const passed: any = [];

  //   const requiredColumns = ['email', 'phone', 'first_name', 'last_name', 'created_at'];
  //   await this.em.transactional(async (em) => {
  //     for (const sheet of workSheetsFromBuffer) {
  //       const columns = sheet.data[0];
  //       if (!requiredColumns.every((column) => columns.includes(column))) {
  //         throw new HttpException(`Invalid file format, required column not found`, 400);
  //       }
  //       const isBarcodeSheet = columns.includes('barcode');
  //       const entries: ImportedCheck[] = sheet.data.slice(1).map((values: string[]) => {
  //         return columns.reduce((acc: ImportedCheck, column: keyof ImportedCheck, index: number) => {
  //           acc[column] = values[index];
  //           return acc;
  //         }, {});
  //       });
  //       for (const entry of entries) {
  //         const phone = entry.phone.replace(/\D/g, '');
  //         let user = await em.findOne(User, { phone });
  //         if (!user) {
  //           user = em.create(User, { phone, email: entry.email, credentials: entry.first_name + ' ' + entry.last_name });
  //           em.persist(user);
  //         }
  //         //mm/dd/yyyy to js date
  //         const parts = entry.created_at.split(' ');
  //         const [day, month, year] = parts[0].split('/');
  //         const checkEntity = em.create(Check, { user, status: checkStatus, barcodeValue: entry.barcode || null, path: '', isBarcode: isBarcodeSheet, createdAt: `${month}/${day}/${year} ${parts[1]}` });
  //         this.em.persist(checkEntity);
  //         statistics[isBarcodeSheet ? 'barcodes' : 'checks'].approved++;
  //         passed.push(checkEntity);
  //       }
  //     }
  //   });
  //   return {
  //     statistics,
  //     passedChecks: passed.map((check: any) => new RetrieveCheckDto(check)),
  //   };
  // }
  async update(id: number, updateCheckDto: UpdateCheckDto) {
    const user = await this.em.findOneOrFail(User, { checks: { id } }, { populate: ['checks', 'checks.status'] });
    const check = user.checks.getItems().find((check) => check.id === id);
    // const approvedAmmount = user.checks.getItems().filter((check) => check.status.name === CheckState.APPROVED).length;
    const check_status = await this.em.findOneOrFail(CheckStatus, { id: Number(updateCheckDto.status) }, { populate: ['comment', 'translation'] });
    let message: string;
    if (check_status.name == CheckState.REJECTED) {
      message = i18n.t(check.user.locale, LOCALES.REJECT_REASON, { reason: i18n.t(check.user.locale, check_status.translation.name) });
    } else if (check_status.name == CheckState.APPROVED) {
      message = i18n.t(check.user.locale, check_status.translation.name, {
        check_id: check.fancyId,
      });
    }
    if (message) {
      this.bot.api.sendMessage(check.user.chatId, message, { parse_mode: 'HTML' }).catch((er) => {});
    }
    check.status = check_status;
    await this.em.persistAndFlush(check);
    return new RetrieveCheckDto(check);
  }
}
