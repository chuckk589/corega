import { Menu } from '@grammyjs/menu';
import { InputFile, Keyboard, NextFunction } from 'grammy';
import { UserGender, Locale } from 'src/modules/mikroorm/entities/User';
import { BotStep } from 'src/types/enums';
import { BaseComposer, BotContext } from 'src/types/interfaces';
import { Command, ComposerController, On, Use } from '../common/decorators';
import { accountMessage, composeMyTicketMessage, label } from '../common/helpers';
import { globalService } from './global.service';
import { Router } from '@grammyjs/router';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
// import { mainKeyboard } from '../common/keyboards';
import i18n from '../middleware/i18n';
import cache from '../common/cache';
import { LOCALES } from '../common/constants';
import { FAQ1_QUESTION_AMOUNT, FAQ2_QUESTION_AMOUNT } from 'src/constants';
import { TicketStatus } from 'src/modules/mikroorm/entities/Ticket';
import { TicketService } from 'src/modules/ticket/ticket.service';
import { Message } from 'grammy/types';
import { join } from 'path';
// import { AccountComposer } from '../account/account.composer';

@ComposerController
export class globalComposer extends BaseComposer {
  constructor(
    // private readonly accountService: AccountService,
    private readonly globalService: globalService,
    private readonly AppConfigService: AppConfigService,
    private readonly ticketService: TicketService,
  ) {
    super();
    this.mMenu.register(this.partMenu);
  }
  @Use(undefined, 'filter')
  tickets = new Menu<BotContext>('ticket-menu').dynamic((ctx, range) => {
    const ticket = ctx.currentTicket;
    switch (ctx.session.step) {
      case BotStep.tickets: {
        range.text(label({ text: LOCALES.my_tickets }), async (ctx) => {
          const tickets = await this.ticketService.findAll({ user: { chatId: ctx.from.id.toString() } });
          if (tickets.length == 0) {
            await ctx.answerCallbackQuery({ text: ctx.i18n.t(LOCALES.no_tickets), show_alert: true });
            return;
          }
          ctx.session.step = BotStep.ticketsEdit;
          ctx.session.userData.tickets.data = tickets;
          ctx.session.userData.tickets.currentIndex = 0;
          await ctx.editMessageText(composeMyTicketMessage(ctx));
        });
        range.text(label({ text: LOCALES.new_ticket }), async (ctx) => {
          ctx.session.step = BotStep.ticketsCreate;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.create_ticket_content));
        });
        break;
      }
      case BotStep.ticketsEdit: {
        range.text(label({ text: LOCALES.get_ticket_content }), async (ctx) => {
          if (ticket.history.length == 0) {
            await ctx.answerCallbackQuery({ text: ctx.i18n.t(LOCALES.no_messages), show_alert: true });
            return;
          }
          const message = ticket.history.map((h) => `[${new Date(h.createdAt).toLocaleString()}] ${h.user}: ${h.message}\n`).join('');
          await ctx.reply(message);
        });
        if (ticket.status != TicketStatus.CLOSED) {
          range.text(label({ text: LOCALES.add_ticket_reply }), async (ctx) => {
            ctx.session.step = BotStep.ticketsReply;
            await ctx.reply(ctx.i18n.t(LOCALES.add_ticket_reply_content));
          });
        }
        range.row();
        range.text(label({ text: LOCALES.cancel }), async (ctx) => {
          ctx.session.step = BotStep.tickets;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.helpDetails), { parse_mode: 'Markdown' });
        });
        range.text(label({ text: LOCALES.prev_ticket }), async (ctx) => {
          if (ctx.session.userData.tickets.data.length <= 1) return;
          ctx.setPrevTicket();
          await ctx.editMessageText(composeMyTicketMessage(ctx));
        });
        range.text(label({ text: LOCALES.next_ticket }), async (ctx) => {
          if (ctx.session.userData.tickets.data.length <= 1) return;
          ctx.setNextTicket();
          await ctx.editMessageText(composeMyTicketMessage(ctx));
        });
        break;
      }
      case BotStep.ticketsCreate: {
        range.text(label({ text: LOCALES.cancel }), async (ctx) => {
          ctx.session.step = BotStep.tickets;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.helpDetails), { parse_mode: 'Markdown' });
        });
        break;
      }
    }
  });

  partMenu = new Menu<BotContext>('part-menu').dynamic((ctx, range) => {
    range.text(label({ text: LOCALES.cancel }), async (ctx) => {
      ctx.session.step = BotStep.default;
      ctx.menu.close();
      const msg = await ctx.replyWithPhoto(cache.resolveAsset(`menu_${ctx.i18n.locale()}`), { reply_markup: this.mMenu });
      cache.cacheAsset(`menu_${ctx.i18n.locale()}`, msg);
    });
    if (ctx.session.step != BotStep.pStep1) {
      range.text(label({ text: LOCALES.back }), async (ctx) => {
        if (ctx.session.step == BotStep.pStep2) {
          ctx.session.step = BotStep.pStep1;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.participate_details), { reply_markup: this.partMenu });
        } else if (ctx.session.step == BotStep.pStep3) {
          await ctx.clean();
          ctx.session.step = BotStep.pStep2;
          const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_photo), { reply_markup: this.partMenu });
          ctx.session.menuId = msg.message_id;
        } else if (ctx.session.step == BotStep.pStep4) {
          ctx.session.step = BotStep.pStep3;
          await ctx.editMessageMedia({ caption: ctx.i18n.t(LOCALES.request_id), media: cache.resolveAsset(`card_${ctx.i18n.locale()}`), type: 'photo' });
        } else if (ctx.session.step == BotStep.pStep5) {
          ctx.session.step = BotStep.pStep4;
          await ctx.clean();
          const msg = await ctx.replyWithPhoto(cache.resolveAsset('pinfl_help'), { caption: ctx.i18n.t(LOCALES.request_pinfl), reply_markup: this.partMenu, parse_mode: 'HTML' });
          cache.cacheAsset('pinfl_help', msg);
          ctx.session.menuId = msg.message_id;
        } else if (ctx.session.step == BotStep.pStep6) {
          ctx.session.step = BotStep.pStep5;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.request_card), { reply_markup: this.partMenu });
        } else if (ctx.session.step == BotStep.pFinish) {
          await ctx.clean();
          ctx.session.step = BotStep.pStep6;
          const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_account), { reply_markup: this.partMenu });
          ctx.session.menuId = msg.message_id;
        }
      });
    }
    if (ctx.session.step == BotStep.pFinish) {
      range.text(label({ text: LOCALES.send }), async (ctx) => {
        ctx.menu.close();
        ctx.session.step = BotStep.default;
        const result = await this.globalService.applyRequest(ctx.from.id, ctx.session.userData.check);
        if (result.error) {
          await ctx.reply(ctx.i18n.t(LOCALES.request_rejected));
        } else {
          await ctx.reply(ctx.i18n.t(LOCALES.request_accepted));
        }
      });
    }
  });

  @Use()
  mMenu = new Menu<BotContext>('main-menu').dynamic((ctx, range) => {
    switch (ctx.session.step) {
      case BotStep.lang: {
        Object.values(Locale).map((lang) =>
          range.text(label({ text: lang as any }), async (ctx) => {
            await this.globalService.updateUser(ctx.from.id, { locale: lang as Locale });
            ctx.i18n.locale(lang);
            ctx.session.step = BotStep.default;
            // const msg = await ctx.replyWithPhoto(cache.resolveAsset(`menu_${lang}`), { reply_markup: this.mMenu });
            // cache.cacheAsset(`menu_${lang}`, msg);
            const msg = await ctx.editMessageMedia({ caption: ctx.i18n.t(LOCALES.main_menu), media: cache.resolveAsset(`menu_${lang}`), type: 'photo' });
            cache.cacheAsset(`menu_${lang}`, msg as Message.PhotoMessage);
          }),
        );
        break;
      }
      case BotStep.default: {
        range.text(label({ text: LOCALES.participate }), async (ctx) => {
          const alreadyParticipated = await this.globalService.checkParticipation(ctx.from.id);
          if (alreadyParticipated) {
            await ctx.reply(ctx.i18n.t(LOCALES.already_participated));
            return;
          }
          ctx.deleteMessage();
          ctx.session.step = BotStep.pStep1;
          const msg = await ctx.reply(ctx.i18n.t(LOCALES.participate_details), { reply_markup: this.partMenu });
          ctx.session.menuId = msg.message_id;
        });
        // range.submenu(label({ text: LOCALES.participate }), 'part-menu', async (ctx) => {
        //   const alreadyParticipated = await this.globalService.checkParticipation(ctx.from.id);
        //   if (alreadyParticipated) {
        //     await ctx.reply(ctx.i18n.t(LOCALES.already_participated));
        //     return;
        //   } else {
        //     ctx.session.step = BotStep.pStep1;
        //     await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.participate_details) });
        //   }
        // });
        range.row();
        range.text(label({ text: LOCALES.rules }), async (ctx) => {
          const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${ctx.i18n.locale()}`));
          cache.cacheAsset(`oferta_${ctx.i18n.locale()}`, msg);
        });
        range.row();
        range.text(label({ text: LOCALES.switch_language }), async (ctx) => {
          // await ctx.reply(ctx.i18n.t(LOCALES.switch_lang_content), { reply_markup: this.lang });
          ctx.session.step = BotStep.lang;
          const msg = await ctx.editMessageMedia({ caption: ctx.i18n.t(LOCALES.switch_lang_content), media: cache.resolveAsset(`lang`), type: 'photo' });
          cache.cacheAsset(`lang`, msg as Message.PhotoMessage);
        });
        range.row();
        range.text(label({ text: LOCALES.about }), async (ctx) => {
          const msg = await ctx.replyWithPhoto(cache.resolveAsset(`about_${ctx.i18n.locale()}`), { caption: ctx.i18n.t(LOCALES.about_details) });
          cache.cacheAsset(`about_${ctx.i18n.locale()}`, msg);
        });
        range.row();
        range.text(label({ text: LOCALES.account }), async (ctx) => {
          const checks = await this.globalService.getUserAccountInfo(ctx);
          await ctx.reply(accountMessage(ctx, checks));
        });
        range.row();
        range.text(label({ text: LOCALES.products }), async (ctx) => {
          await ctx.reply(ctx.i18n.t(LOCALES.products_details));
        });
        range.row();
        range.text(label({ text: LOCALES.faq }), async (ctx) => {
          ctx.session.step = BotStep.faq;
          await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.faq_details) });
        });
        range.row();
        range.text(label({ text: LOCALES.contacts }), async (ctx) => {
          // await ctx.reply(ctx.i18n.t(LOCALES.contacts_details));
          ctx.session.step = BotStep.tickets;
          ctx.session.userData.tickets.data = await this.ticketService.findAll({ user: { chatId: ctx.from.id.toString() } });
          await ctx.reply(ctx.i18n.t(LOCALES.helpDetails), { reply_markup: this.tickets, parse_mode: 'Markdown' });
        });
        break;
      }
      case BotStep.faq: {
        range
          .text(label({ text: LOCALES.product_questions }), async (ctx) => {
            // ctx.session.step = BotStep.faq1;
            // await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.product_questions) });
            const msg = await ctx.replyWithDocument(cache.resolveAsset(`prod_${ctx.i18n.locale()}`));
            cache.cacheAsset(`prod_${ctx.i18n.locale()}`, msg);
          })
          .row();
        range
          .text(label({ text: LOCALES.promo_questions }), async (ctx) => {
            // ctx.session.step = BotStep.faq2;
            // await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.promo_questions) });
            const msg = await ctx.replyWithDocument(cache.resolveAsset(`promo_${ctx.i18n.locale()}`));
            cache.cacheAsset(`promo_${ctx.i18n.locale()}`, msg);
          })
          .row();
        range.text(label({ text: LOCALES.back }), async (ctx) => {
          ctx.session.step = BotStep.default;
          await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.main_menu) });
        });
        break;
      }
      // case BotStep.faq2: {
      //   const questionKeys = Array.from({ length: FAQ2_QUESTION_AMOUNT }, (_, idx) => {
      //     return 'question_' + (idx + 1);
      //   });
      //   for (const key of questionKeys) {
      //     range.text(label({ text: key as any }), async (ctx) => {
      //       await ctx.reply(ctx.i18n.t((key + '_answer') as any));
      //     });
      //     range.row();
      //   }
      //   range.text(label({ text: LOCALES.back }), async (ctx) => {
      //     ctx.session.step = BotStep.default;
      //     await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.main_menu) });
      //   });
      //   break;
      // }
      // case BotStep.faq1: {
      //   const questionKeys = Array.from({ length: FAQ1_QUESTION_AMOUNT }, (_, idx) => {
      //     return 'question_' + (idx + 1) + 'p';
      //   });
      //   for (const key of questionKeys) {
      //     range.text(label({ text: key as any }), async (ctx) => {
      //       await ctx.reply(ctx.i18n.t((key + '_answer') as any));
      //     });
      //     range.row();
      //   }
      //   range.text(label({ text: LOCALES.back }), async (ctx) => {
      //     ctx.session.step = BotStep.default;
      //     await ctx.editMessageCaption({ caption: ctx.i18n.t(LOCALES.main_menu) });
      //   });
      //   break;
      // }
    }
  });

  @Use()
  menu = new Menu<BotContext>('reg-menu').dynamic((ctx, range) => {
    const locale = ctx.i18n.locale() as Locale;
    switch (ctx.session.step) {
      case BotStep.default: {
        Object.values(Locale).map((lang) =>
          range.text(label({ text: lang as any }), async (ctx) => {
            ctx.i18n.locale(lang);
            ctx.session.step = BotStep.rules;
            ctx.session.userData.locale = lang;
            ctx.menu.close();
            const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${lang}`), { reply_markup: this.menu });
            cache.cacheAsset(`oferta_${lang}`, msg);
          }),
        );
        break;
      }
      case BotStep.rules: {
        range.text(label({ text: LOCALES.accept }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.phone;

          const msg = await ctx.replyWithPhoto(cache.resolveAsset(`phone_${ctx.i18n.locale()}`), { reply_markup: new Keyboard().requestContact(ctx.i18n.t(LOCALES.contact)).oneTime().resized() });
          cache.cacheAsset(`phone_${ctx.i18n.locale()}`, msg);
        });
        range.text(label({ text: LOCALES.reject }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.default;
          await ctx.reply(ctx.i18n.t(LOCALES.restricted_rules));
        });
        break;
      }
      case BotStep.age: {
        range.text(label({ text: LOCALES.yes }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.resident;
          await ctx.reply(ctx.i18n.t(LOCALES.ask_residence), { reply_markup: this.menu });
        });
        range.text(label({ text: LOCALES.no }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.default;
          await ctx.reply(ctx.i18n.t(LOCALES.restricted_age));
        });
        break;
      }
      case BotStep.resident: {
        range.text(label({ text: LOCALES.yes }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.name;
          await ctx.reply(ctx.i18n.t(LOCALES.ask_name), { reply_markup: { remove_keyboard: true } });
        });
        range.text(label({ text: LOCALES.no }), async (ctx) => {
          ctx.session.step = BotStep.residentDecline;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.restricted_residence));
        });
        break;
      }
      case BotStep.residentDecline: {
        range.text(label({ text: LOCALES.back }), async (ctx) => {
          ctx.session.step = BotStep.resident;
          await ctx.editMessageText(ctx.i18n.t(LOCALES.ask_residence));
        });
        break;
      }
      case BotStep.city: {
        this.AppConfigService.cities.map((city, index) => {
          range.text(label({ text: city.translation[locale] as any }), async (ctx) => {
            ctx.session.step = BotStep.default;
            ctx.session.isRegistered = true;
            ctx.session.userData.city_id = city.id;
            ctx.menu.close();
            await this.globalService.finishRegistration(ctx);
            // await ctx.reply(ctx.i18n.t(LOCALES.registered), { reply_markup: mainKeyboard(ctx) });
            const msg = await ctx.replyWithPhoto(cache.resolveAsset(`menu_${ctx.i18n.locale()}`), { reply_markup: this.mMenu });
            cache.cacheAsset(`menu_${ctx.i18n.locale()}`, msg);
          }),
            index % 3 === 0 && range.row();
        });
        break;
      }
    }

    return range;
  });

  @Command('start')
  start = async (ctx: BotContext) => {
    ctx.session.step = BotStep.default;
    const user = await this.globalService.getUser(ctx);
    ctx.session.isRegistered = user.registered;
    // ctx.session.isRegistered = false;
    ctx.i18n.locale(user.locale);
    if (ctx.session.isRegistered) {
      // await ctx.reply(ctx.i18n.t(LOCALES.main_menu), { reply_markup: mainKeyboard(ctx) });
      const msg = await ctx.replyWithPhoto(cache.resolveAsset(`menu_${ctx.i18n.locale()}`), { reply_markup: this.mMenu });
      cache.cacheAsset(`menu_${ctx.i18n.locale()}`, msg);
    } else {
      const msg = await ctx.replyWithPhoto(cache.resolveAsset('lang'), { reply_markup: this.menu });
      cache.cacheAsset('lang', msg);
    }
  };
  @Command('menu')
  start2 = this.start;

  @Command('rules')
  rules = async (ctx: BotContext) => {
    const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${ctx.i18n.locale()}`));
    cache.cacheAsset(`oferta_${ctx.i18n.locale()}`, msg);
  };
  @Command('contacts')
  contacts = async (ctx: BotContext) => {
    // await ctx.reply(ctx.i18n.t(LOCALES.contacts_details));
    ctx.session.step = BotStep.tickets;
    ctx.session.userData.tickets.data = await this.ticketService.findAll({ user: { chatId: ctx.from.id.toString() } });
    await ctx.reply(ctx.i18n.t(LOCALES.helpDetails), { reply_markup: this.tickets, parse_mode: 'Markdown' });
  };
  @On(':contact')
  contact = async (ctx: BotContext) => {
    if (ctx.session.step == BotStep.phone) {
      ctx.session.userData.phone = ctx.message.contact.phone_number;
      ctx.session.step = BotStep.age;
      await ctx.reply(ctx.i18n.t(LOCALES.ask_age), { reply_markup: this.menu });
    }
  };

  //only if message not empty
  @Use()
  router = new Router<BotContext>((ctx: BotContext) => {
    if (ctx.session.step && ctx.message?.text) return ctx.session.step;
  })
    .route(BotStep.name, async (ctx: BotContext) => {
      ctx.session.userData.credentials = ctx.message.text;
      ctx.session.step = BotStep.city;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_city, { name: ctx.session.userData.credentials }), { reply_markup: this.menu });
      const msg = await ctx.replyWithPhoto(cache.resolveAsset(`city_${ctx.i18n.locale()}`), { caption: ctx.i18n.t(LOCALES.ask_city), reply_markup: this.menu });
      cache.cacheAsset(`city_${ctx.i18n.locale()}`, msg);
    })
    .route(BotStep.pStep4, async (ctx: BotContext) => {
      ctx.session.userData.check.pinfl = ctx.message.text;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.validateMenu });
      ctx.session.step = BotStep.pStep5;
      await ctx.clean();
      const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_card), { reply_markup: this.partMenu });
      ctx.session.menuId = msg.message_id;
    })
    .route(BotStep.pStep5, async (ctx: BotContext) => {
      ctx.session.userData.check.cardNumber = ctx.message.text;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.validateMenu });
      ctx.session.step = BotStep.pStep6;
      await ctx.clean();
      const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_account), { reply_markup: this.partMenu });
      ctx.session.menuId = msg.message_id;
    })
    .route(BotStep.pStep6, async (ctx: BotContext) => {
      ctx.session.userData.check.accountNumber = ctx.message.text;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.validateMenu });
      ctx.session.step = BotStep.pFinish;
      await ctx.clean();
      const path = join(__dirname, '../../../public/');

      await ctx.replyWithMediaGroup([
        { type: 'photo', media: new InputFile(path + ctx.session.userData.check.checkPath), caption: 'Check' },
        { type: 'photo', media: new InputFile(path + ctx.session.userData.check.goodPath), caption: 'Good' },
        { type: 'photo', media: new InputFile(path + ctx.session.userData.check.idPath), caption: 'ID' },
      ]);
      await ctx.reply(ctx.i18n.t(LOCALES.ask_validation, { pinfl: ctx.session.userData.check.pinfl, cardNumber: ctx.session.userData.check.cardNumber, transitAccount: ctx.session.userData.check.accountNumber }), {
        reply_markup: this.partMenu,
      });
    })
    .route(BotStep.ticketsReply, async (ctx: BotContext) => {
      if (ctx.message) {
        await this.ticketService.update(+ctx.currentTicket.id, {
          response: ctx.message.text,
          chatId: ctx.from.id,
        });
        ctx.session.step = BotStep.ticketsEdit;
        await ctx.reply(ctx.i18n.t(LOCALES.ticket_reply_added));
      }
    })
    .route(BotStep.ticketsCreate, async (ctx: BotContext) => {
      if (ctx.message) {
        await this.ticketService.create({ object: ctx.message.text, chatId: ctx.from.id.toString() });
        ctx.session.step = BotStep.default;
        await ctx.reply(ctx.i18n.t(LOCALES.ticket_created));
      }
    });

  @On(':photo')
  photo = async (ctx: BotContext) => {
    //upload check
    if (ctx.session.step == BotStep.pStep1) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.checkPath = path;
      await ctx.clean();
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.mMenu });
      ctx.session.step = BotStep.pStep2;
      const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_photo), { reply_markup: this.partMenu });
      ctx.session.menuId = msg.message_id;
    }
    //upload good
    else if (ctx.session.step == BotStep.pStep2) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.goodPath = path;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.validateMenu });
      await ctx.clean();
      ctx.session.step = BotStep.pStep3;
      // const msg = await ctx.reply(ctx.i18n.t(LOCALES.request_id), { reply_markup: this.partMenu });
      const msg = await ctx.replyWithPhoto(cache.resolveAsset(`card_${ctx.i18n.locale()}`), { caption: ctx.i18n.t(LOCALES.request_id), reply_markup: this.partMenu });
      cache.cacheAsset(`card_${ctx.i18n.locale()}`, msg);
      ctx.session.menuId = msg.message_id;
    }
    //upload id
    else if (ctx.session.step == BotStep.pStep3) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.idPath = path;
      // await ctx.reply(ctx.i18n.t(LOCALES.ask_validation), { reply_markup: this.validateMenu });
      ctx.session.step = BotStep.pStep4;
      await ctx.clean();
      const msg = await ctx.replyWithPhoto(cache.resolveAsset('pinfl_help'), { caption: ctx.i18n.t(LOCALES.request_pinfl), reply_markup: this.partMenu, parse_mode: 'HTML' });
      cache.cacheAsset('pinfl_help', msg);
      ctx.session.menuId = msg.message_id;
    }
  };
  @Command('clean')
  clean = async (ctx: BotContext) => {
    await this.globalService.clean(ctx.from.id);
    await ctx.reply('Cleaned', { reply_markup: { remove_keyboard: true } });
  };
}
