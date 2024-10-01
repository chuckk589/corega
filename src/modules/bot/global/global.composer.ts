import { Menu } from '@grammyjs/menu';
import { InputFile, Keyboard, NextFunction } from 'grammy';
import { UserGender, Locale } from 'src/modules/mikroorm/entities/User';
import { BotStep } from 'src/types/enums';
import { BaseComposer, BotContext } from 'src/types/interfaces';
import { Command, ComposerController, On, Use } from '../common/decorators';
import { label } from '../common/helpers';
import { globalService } from './global.service';
import { Router } from '@grammyjs/router';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
// import { mainKeyboard } from '../common/keyboards';
import i18n from '../middleware/i18n';
import cache from '../common/cache';
import { LOCALES } from '../common/constants';
import { FAQ_QUESTION_AMOUNT } from 'src/constants';
// import { AccountComposer } from '../account/account.composer';

@ComposerController
export class globalComposer extends BaseComposer {
  constructor(
    // private readonly accountService: AccountService,
    private readonly globalService: globalService,
    private readonly AppConfigService: AppConfigService,
  ) {
    super();
  }
  @Use()
  faq = new Menu<BotContext>('faq-menu').dynamic((ctx, range) => {
    const questionKeys = Array.from({ length: FAQ_QUESTION_AMOUNT }, (_, idx) => {
      return 'question_' + (idx + 1);
    });
    for (const key of questionKeys) {
      range.text(label({ text: key as any }), async (ctx) => {
        await ctx.reply(ctx.i18n.t((key + '_answer') as any));
      });
      range.row();
    }
  });
  @Use()
  lang = new Menu<BotContext>('lang-menu').dynamic((ctx, range) => {
    Object.values(Locale).map((lang) =>
      range.text(label({ text: lang as any }), async (ctx) => {
        await this.globalService.updateUser(ctx.from.id, { locale: lang as Locale });
        ctx.i18n.locale(lang);
        await ctx.deleteMessage();
        await ctx.reply(ctx.i18n.t(LOCALES.language_changed));
      }),
    );
  });
  @Use()
  mMenu = new Menu<BotContext>('main-menu').dynamic((ctx, range) => {
    range.text(label({ text: LOCALES.participate }), async (ctx) => {
      ctx.session.step = BotStep.pStep1;
      await ctx.reply(ctx.i18n.t(LOCALES.participate_details));
    });
    range.row();
    range.text(label({ text: LOCALES.rules }), async (ctx) => {
      const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${ctx.i18n.locale()}`));
      cache.cacheAsset(`oferta_${ctx.i18n.locale()}`, msg);
    });
    range.row();
    range.text(label({ text: LOCALES.switch_language }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.switch_lang_content), { reply_markup: this.lang });
    });
    range.row();
    range.text(label({ text: LOCALES.about }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.about_details));
    });
    range.row();
    range.text(label({ text: LOCALES.account }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.account));
    });
    range.row();
    range.text(label({ text: LOCALES.products }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.products_details));
    });
    range.row();
    range.text(label({ text: LOCALES.faq }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.faq_details), { reply_markup: this.faq });
    });
    range.row();
    range.text(label({ text: LOCALES.contacts }), async (ctx) => {
      await ctx.reply(ctx.i18n.t(LOCALES.contacts_details));
    });
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
            const msg = await ctx.replyWithDocument(cache.resolveAsset(`oferta_${lang}`), { caption: ctx.i18n.t(LOCALES.ask_rules), reply_markup: this.menu });
            cache.cacheAsset(`oferta_${lang}`, msg);
          }),
        );
        break;
      }
      case BotStep.rules: {
        range.text(label({ text: LOCALES.accept }), async (ctx) => {
          ctx.menu.close();
          ctx.session.step = BotStep.phone;

          const msg = await ctx.replyWithPhoto(cache.resolveAsset('phone'), { reply_markup: new Keyboard().requestContact(ctx.i18n.t(LOCALES.contact)) });
          cache.cacheAsset('phone', msg);
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
          ctx.menu.close();
          ctx.session.step = BotStep.default;
          await ctx.reply(ctx.i18n.t(LOCALES.restricted_residence), { reply_markup: { remove_keyboard: true } });
        });
        break;
      }
      case BotStep.city: {
        this.AppConfigService.cities.map((city, index) => {
          range.text(label({ text: city.translation[locale] as any }), async (ctx) => {
            ctx.session.step = BotStep.default;
            ctx.session.isRegistered = true;
            ctx.session.userData.city_id = city.id;
            // ctx.menu.close();
            await this.globalService.finishRegistration(ctx);
            // await ctx.reply(ctx.i18n.t(LOCALES.registered), { reply_markup: mainKeyboard(ctx) });
            const msg = await ctx.replyWithPhoto(cache.resolveAsset('about_' + ctx.i18n.locale()), { caption: ctx.i18n.t(LOCALES.about_details), reply_markup: this.mMenu });
            cache.cacheAsset('about_' + ctx.i18n.locale(), msg);
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
      const msg = await ctx.replyWithPhoto(cache.resolveAsset('menu'), { reply_markup: this.mMenu });
      cache.cacheAsset('menu', msg);
    } else {
      const msg = await ctx.replyWithPhoto(cache.resolveAsset('start'), { reply_markup: this.menu });
      cache.cacheAsset('start', msg);
    }
  };
  @On(':contact')
  contact = async (ctx: BotContext) => {
    if (ctx.session.step == BotStep.phone) {
      ctx.session.userData.phone = ctx.message.contact.phone_number;
      ctx.session.step = BotStep.age;
      await ctx.reply(ctx.i18n.t(LOCALES.ask_age), { reply_markup: this.menu });
    }
  };

  @Use()
  router = new Router<BotContext>((ctx: BotContext) => ctx.session.step)
    .route(BotStep.name, async (ctx: BotContext) => {
      ctx.session.userData.credentials = ctx.message.text;
      ctx.session.step = BotStep.city;
      await ctx.reply(ctx.i18n.t(LOCALES.ask_city, { name: ctx.session.userData.credentials }), { reply_markup: this.menu });
    })
    .route(BotStep.pStep4, async (ctx: BotContext) => {
      ctx.session.userData.check.pinfl = ctx.message.text;
      ctx.session.step = BotStep.pStep5;
      await ctx.reply(ctx.i18n.t(LOCALES.request_card));
    })
    .route(BotStep.pStep5, async (ctx: BotContext) => {
      ctx.session.userData.check.cardNumber = ctx.message.text;
      ctx.session.step = BotStep.default;
      await this.globalService.applyRequest(ctx.from.id, ctx.session.userData.check);
      await ctx.reply(ctx.i18n.t(LOCALES.request_accepted));
    });

  @On(':photo')
  photo = async (ctx: BotContext) => {
    //upload check
    if (ctx.session.step == BotStep.pStep1) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.checkPath = path;
      ctx.session.step = BotStep.pStep2;
      await ctx.reply(ctx.i18n.t(LOCALES.request_photo));
    }
    //upload good
    else if (ctx.session.step == BotStep.pStep2) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.goodPath = path;
      ctx.session.step = BotStep.pStep3;
      await ctx.reply(ctx.i18n.t(LOCALES.request_id));
    }
    //upload id
    else if (ctx.session.step == BotStep.pStep3) {
      const path = await this.globalService.downloadFile(ctx);
      ctx.session.userData.check.idPath = path;
      ctx.session.step = BotStep.pStep4;
      await ctx.reply(ctx.i18n.t(LOCALES.request_id));
    }
    // const checkTypeKey = ctx.session.step == BotStep.uploadBarcode ? 'barcodeAccepted' : 'checkAccepted';
  };
  @Command('clean')
  clean = async (ctx: BotContext) => {
    await this.globalService.clean(ctx.from.id);
    await ctx.reply('Cleaned', { reply_markup: { remove_keyboard: true } });
  };
}
