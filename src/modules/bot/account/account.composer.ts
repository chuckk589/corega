// import { BaseComposer, BotContext } from 'src/types/interfaces';
// import { ComposerController, Filter, Hears, On, Use } from '../common/decorators';
// import { AccountService } from './account.service';
// import { AppConfigService } from 'src/modules/app-config/app-config.service';
// import { Menu } from '@grammyjs/menu';
// import { composeMyTicketMessage, label, prizeMessage } from '../common/helpers';
// import { InlineKeyboard, InputFile } from 'grammy';
// import { Locale } from 'src/modules/mikroorm/entities/User';
// import { backKeyboard } from '../common/keyboards';
// import { BotStep } from 'src/types/enums';
// import { Router } from '@grammyjs/router';
// import { TicketService } from 'src/modules/ticket/ticket.service';
// import { TicketStatus } from 'src/modules/mikroorm/entities/TicketMessage';
// import cache from '../common/cache';
// import { FAQ_QUESTION_AMOUNT } from 'src/constants';
// import { LOCALES } from '../common/constants';

// @ComposerController
// export class AccountComposer extends BaseComposer {
// constructor(private readonly accountService: AccountService, private readonly ticketService: TicketService) {
//   super();
// }
// @Filter()
// filter = async (ctx: BotContext) => {
//   const isRegistered = await this.accountService.isRegistered(ctx);
//   return isRegistered ? true : !(await ctx.reply(ctx.i18n.t(LOCALES.not_registered)));
// };
// // @Use(undefined, 'filter')
// // menu = new Menu<BotContext>('winner-menu').dynamic((ctx, range) => {
// //   const weeks = Array.from(new Set(ctx.session.winners.map((winner) => winner.week)));
// //   weeks.map((week, idx) => {
// //     range.text(label({ text: (ctx.i18n.t(LOCALES.week) + ' ' + (idx + 1)) as any }), async (ctx) => {
// //       await ctx.reply(prizeMessageWeek(ctx, week));
// //     });
// //     if ((idx + 1) % 2 == 0) {
// //       range.row();
// //     }
// //   });
// // });
// @Use(undefined, 'filter')
// lang = new Menu<BotContext>('lang-menu').dynamic((ctx, range) => {
//   Object.values(Locale).map((lang) =>
//     range.text(label({ text: lang as any }), async (ctx) => {
//       await this.accountService.updateUser(ctx.from.id, { locale: lang as Locale });
//       ctx.i18n.locale(lang);
//       await ctx.deleteMessage();
//       await ctx.reply(ctx.i18n.t(LOCALES.language_changed), { reply_markup: mainKeyboard(ctx) });
//     }),
//   );
// });
// @Use(undefined, 'filter')
// tickets = new Menu<BotContext>('ticket-menu').dynamic((ctx, range) => {
//   const ticket = ctx.currentTicket;
//   switch (ctx.session.step) {
//     case BotStep.tickets: {
//       range.text(label({ text: LOCALES.my_tickets }), async (ctx) => {
//         const tickets = await this.ticketService.findAll({ user: { chatId: ctx.from.id.toString() } });
//         if (tickets.length == 0) {
//           await ctx.answerCallbackQuery({ text: ctx.i18n.t(LOCALES.no_tickets), show_alert: true });
//           return;
//         }
//         ctx.session.step = BotStep.ticketsEdit;
//         ctx.session.userData.tickets.data = tickets;
//         ctx.session.userData.tickets.currentIndex = 0;
//         await ctx.editMessageText(composeMyTicketMessage(ctx));
//       });
//       range.text(label({ text: LOCALES.new_ticket }), async (ctx) => {
//         ctx.session.step = BotStep.ticketsCreate;
//         await ctx.editMessageText(ctx.i18n.t(LOCALES.create_ticket_content));
//       });
//       break;
//     }
//     case BotStep.ticketsEdit: {
//       range.text(label({ text: LOCALES.get_ticket_content }), async (ctx) => {
//         if (ticket.history.length == 0) {
//           await ctx.answerCallbackQuery({ text: ctx.i18n.t(LOCALES.no_messages), show_alert: true });
//           return;
//         }
//         const message = ticket.history.map((h) => `[${new Date(h.createdAt).toLocaleString()}] ${h.user}: ${h.message}\n`).join('');
//         await ctx.reply(message);
//       });
//       if (ticket.status != TicketStatus.CLOSED) {
//         range.text(label({ text: LOCALES.add_ticket_reply }), async (ctx) => {
//           ctx.session.step = BotStep.ticketsReply;
//           await ctx.reply(ctx.i18n.t(LOCALES.add_ticket_reply_content));
//         });
//       }
//       range.row();
//       range.text(label({ text: LOCALES.cancel }), async (ctx) => {
//         ctx.session.step = BotStep.tickets;
//         await ctx.editMessageText(ctx.i18n.t(LOCALES.help_details));
//       });
//       range.text(label({ text: LOCALES.prev_ticket }), async (ctx) => {
//         if (ctx.session.userData.tickets.data.length <= 1) return;
//         ctx.setPrevTicket();
//         await ctx.editMessageText(composeMyTicketMessage(ctx));
//       });
//       range.text(label({ text: LOCALES.next_ticket }), async (ctx) => {
//         if (ctx.session.userData.tickets.data.length <= 1) return;
//         ctx.setNextTicket();
//         await ctx.editMessageText(composeMyTicketMessage(ctx));
//       });
//       break;
//     }
//     case BotStep.ticketsCreate: {
//       range.text(label({ text: LOCALES.cancel }), async (ctx) => {
//         ctx.session.step = BotStep.tickets;
//         await ctx.editMessageText(ctx.i18n.t(LOCALES.help_details));
//       });
//       break;
//     }
//   }
// });
// @Use(undefined, 'filter')
// faq = new Menu<BotContext>('faq-menu').dynamic((ctx, range) => {
//   const questionKeys = Array.from({ length: FAQ_QUESTION_AMOUNT }, (_, idx) => {
//     return 'question_' + (idx + 1);
//   });
//   for (const key of questionKeys) {
//     range.text(label({ text: key as any }), async (ctx) => {
//       await ctx.reply(ctx.i18n.t((key + '_answer') as any));
//     });
//     range.row();
//   }
// });
// @Hears('participate', 'filter')
// takePart = async (ctx: BotContext) => {
//   ctx.session.step = BotStep.uploadCheck;
//   // await ctx.reply(ctx.i18n.t(LOCALES.participate_details), { reply_markup: backKeyboard(ctx) });
//   const msg = await ctx.replyWithPhoto(cache.resolveAsset('parCheck_' + ctx.i18n.locale()), { caption: ctx.i18n.t(LOCALES.participate_details), reply_markup: backKeyboard(ctx) });
//   cache.cacheAsset('parCheck_' + ctx.i18n.locale(), msg);
// };
// @Hears('back', 'filter')
// back = async (ctx: BotContext) => {
//   ctx.session.step = BotStep.default;
//   await ctx.reply(ctx.i18n.t(LOCALES.main_menu), { reply_markup: mainKeyboard(ctx) });
// };
// @Hears('about', 'filter')
// about = async (ctx: BotContext) => {
//   const msg = await ctx.replyWithPhoto(cache.resolveAsset('about_' + ctx.i18n.locale()), { caption: ctx.i18n.t(LOCALES.about_details), reply_markup: backKeyboard(ctx) });
//   cache.cacheAsset('about_' + ctx.i18n.locale(), msg);
// };
// @Hears('faq', 'filter')
// contactUs = async (ctx: BotContext) => {
//   // ctx.session.step = BotStep.help;
//   await ctx.reply(ctx.i18n.t(LOCALES.faq_details), { reply_markup: this.faq });
// };
// @Hears('help', 'filter')
// help = async (ctx: BotContext) => {
//   ctx.session.step = BotStep.tickets;
//   ctx.session.userData.tickets.data = await this.ticketService.findAll({ user: { chatId: ctx.from.id.toString() } });
//   // await ctx.cleanReplySave(ctx.i18n.t(LOCALES.help_details), { reply_markup: this.tickets });
// };
// // @Hears('switchLanguage', 'filter')
// // switchLanguage = async (ctx: BotContext) => {
// //   await ctx.reply(ctx.i18n.t(LOCALES.switch_lang_content), { reply_markup: this.lang });
// // };
// @Hears('contacts', 'filter')
// contacts = async (ctx: BotContext) => {
//   // await ctx.reply(ctx.i18n.t(LOCALES.contactsDetails));
//   const msg = await ctx.replyWithPhoto(cache.resolveAsset('contacts_' + ctx.i18n.locale()), { caption: ctx.i18n.t(LOCALES.contacts_details), reply_markup: backKeyboard(ctx) });
//   cache.cacheAsset('contacts_' + ctx.i18n.locale(), msg);
// };
// // @Hears('winners', 'filter')
// // winners = async (ctx: BotContext) => {
// //   ctx.session.winners = await this.accountService.getLotteries();
// //   await ctx.cleanReplySave(winnersMessage(ctx), { reply_markup: this.menu });
// // };
// // @Hears('account', 'filter')
// // account = async (ctx: BotContext) => {
// //   const checks = await this.accountService.getUserAccountInfo(ctx);
// //   await ctx.reply(accountMessage(ctx, checks), { reply_markup: backKeyboard(ctx) });
// // };
// @Hears('rules', 'filter')
// rules = async (ctx: BotContext) => {
//   const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${ctx.i18n.locale()}`), { caption: ctx.i18n.t(LOCALES.get_rules), reply_markup: backKeyboard(ctx) });
//   cache.cacheAsset(`oferta_${ctx.i18n.locale()}`, msg);
// };
// // @On(':photo', 'filter')
// // photo = async (ctx: BotContext) => {
// //   if (![BotStep.uploadBarcode, BotStep.uploadCheck].includes(ctx.session.step)) return;
// //   const path = await this.accountService.downloadFile(ctx);
// //   const result = await this.accountService.registerCheck(ctx.from.id, path, ctx.session.step == BotStep.uploadBarcode);
// //   // if (result.error) {
// //   //   await ctx.reply(ctx.i18n.t(LOCALES.maxBarcodeCount));
// //   //   return;
// //   // }
// //   const checkTypeKey = ctx.session.step == BotStep.uploadBarcode ? 'barcodeAccepted' : 'checkAccepted';
// //   // await ctx.reply(ctx.i18n.t(checkTypeKey));
// // };
// @Use(undefined, 'filter')
// router = new Router<BotContext>((ctx: BotContext) => ctx.session.step)
//   .route(BotStep.ticketsReply, async (ctx: BotContext) => {
//     if (ctx.message) {
//       await this.ticketService.update(+ctx.currentTicket.id, {
//         response: ctx.message.text,
//         chatId: ctx.from.id,
//       });
//       ctx.session.step = BotStep.ticketsEdit;
//       await ctx.reply(ctx.i18n.t(LOCALES.ticket_reply_added));
//     }
//   })
//   .route(BotStep.ticketsCreate, async (ctx: BotContext) => {
//     if (ctx.message) {
//       await this.ticketService.create({ object: ctx.message.text, chatId: ctx.from.id.toString() });
//       ctx.session.step = BotStep.default;
//       await ctx.reply(ctx.i18n.t(LOCALES.ticket_created));
//     }
//   });
// // .otherwise(async (ctx: BotContext) => {
// //   await ctx.reply(ctx.i18n.t(LOCALES.main_menu), { reply_markup: mainKeyboard(ctx) });
// // });
// }
