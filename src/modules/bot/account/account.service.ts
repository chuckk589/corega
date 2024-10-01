// import { EntityDTO, EntityManager, PopulateHint, UniqueConstraintViolationException, wrap } from '@mikro-orm/core';
// import { Injectable } from '@nestjs/common';
// import { AppConfigService } from 'src/modules/app-config/app-config.service';
// import { Locale, User } from 'src/modules/mikroorm/entities/User';
// import { BotContext, CheckData } from 'src/types/interfaces';
// import axios from 'axios';
// import fs from 'fs';
// import { Check } from 'src/modules/mikroorm/entities/Check';
// import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
// import { Winner } from 'src/modules/mikroorm/entities/Winner';
// import { CheckState } from 'src/modules/mikroorm/entities/CheckStatus';
// import { BotLotteryDto, Lottery } from 'src/modules/mikroorm/entities/Lottery';
// import { LotteryState } from 'src/modules/mikroorm/entities/LotteryStatus';
// import { MAX_BARCODE_COUNT } from 'src/constants';

// @Injectable()
// export class AccountService {
//   constructor(private readonly em: EntityManager, private readonly AppConfigService: AppConfigService, @InjectPinoLogger('AccountService') private readonly logger: PinoLogger) {}
//   async updateUser(from: number, options: Partial<User>) {
//     await this.em.nativeUpdate(User, { chatId: String(from) }, options);
//   }
//   async getLotteries(): Promise<BotLotteryDto[]> {
//     const lotteries = await this.em.find(
//       Lottery,
//       {
//         status: { name: LotteryState.ENDED },
//       },
//       {
//         populate: ['winners.check', 'winners.check.user', 'winners.prizeValue', 'prize'],
//         refresh: true,
//         populateWhere: {
//           winners: {
//             confirmed: true,
//             check: { status: { name: CheckState.APPROVED } },
//           },
//         },
//       },
//     );
//     return lotteries.map((l) => new BotLotteryDto(l));
//   }

//   async getUserAccountInfo(ctx: BotContext): Promise<Check[]> {
//     const userChecks = await this.em.find(
//       Check,
//       { user: { chatId: String(ctx.from.id) } },
//       {
//         refresh: true,
//         populate: ['winners.prizeValue', 'status.comment.values', 'status.translation.values'],
//         populateWhere: {
//           winners: {
//             confirmed: true,
//             lottery: { status: { name: LotteryState.ENDED } },
//           },
//         },
//       },
//     );

//     return userChecks;
//   }
//   async registerCheck(from: number, path: string, isBarcode = false): Promise<CheckData> {
//     const user = await this.em.findOneOrFail(User, { chatId: String(from) }, { populate: ['checks'] });
//     if (isBarcode) {
//       const barcodes = user.checks.getItems().filter((c) => c.isBarcode);
//       //if theres a registered barcode today -> return
//       const today = new Date().toDateString();
//       if (barcodes.some((c) => c.createdAt.toDateString() == today)) {
//         return { error: true };
//       }
//       //if theres more barcodes than limit -> return
//       if (barcodes.length >= MAX_BARCODE_COUNT) {
//         return { error: true };
//       }
//     }
//     return await this.insertNewCheck(user, path, isBarcode);
//   }
//   async insertNewCheck(user: User, path: string, isBarcode: boolean): Promise<CheckData> {
//     try {
//       const check = new Check({ path, isBarcode });
//       user.checks.add(check);
//       await this.em.persistAndFlush(user);
//       return { error: false, fancyId: check.fancyId };
//     } catch (error) {
//       if (error.code === 'ER_DUP_ENTRY') {
//         this.logger.warn(`Failed to insert new check: ER_DUP_ENTRY ${user.chatId}`);
//         return await this.insertNewCheck(user, path, isBarcode);
//       }
//     }
//   }
//   downloadFile(ctx: BotContext): Promise<string> {
//     return new Promise((res, rej) => {
//       ctx
//         .getFile() //
//         .then((file) => {
//           const token = this.AppConfigService.get('BOT_TOKEN_PROD');
//           axios({
//             url: `http://api.telegram.org/file/bot${token}/${file.file_path}`,
//             method: 'GET',
//             responseType: 'stream',
//           }).then((response) => {
//             const uploaddir = `/files/${ctx.from.id}`;
//             const filename = `${Date.now()}.${file.file_path.split('.').pop()}`;
//             if (!fs.existsSync(`./dist/public${uploaddir}`)) {
//               fs.mkdirSync(`./dist/public${uploaddir}`, { recursive: true });
//             }
//             const photo = fs.createWriteStream(`./dist/public${uploaddir}/${filename}`);
//             response.data.pipe(photo).on('finish', function () {
//               res(`${uploaddir}/${filename}`);
//             });
//           });
//         });
//     });
//   }
//   async isRegistered(ctx: BotContext): Promise<boolean> {
//     switch (ctx.session.isRegistered) {
//       case undefined: {
//         const user = await this.em.findOneOrFail(User, { chatId: String(ctx.from.id) });
//         ctx.i18n.locale(user.locale);
//         ctx.session.isRegistered = user.registered;
//         return ctx.session.isRegistered;
//       }
//       default:
//         return ctx.session.isRegistered;
//     }
//   }
// }
