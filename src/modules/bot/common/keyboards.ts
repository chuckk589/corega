import { Keyboard } from 'grammy';
import { BotContext } from 'src/types/interfaces';
import i18n from '../middleware/i18n';
import { LOCALES } from './constants';

// keyboards
// export const mainKeyboard = (ctx: BotContext): Keyboard => {
//   return (
//     new Keyboard()
//       // .text(ctx.i18n.t(ctx.session.checkCount > 0 ? 'participateSecondary' : 'participate'))
//       .text(ctx.i18n.t(LOCALES.participate))
//       .row()
//       .text(ctx.i18n.t(LOCALES.about))
//       .text(ctx.i18n.t(LOCALES.account))
//       .row()
//       .text(ctx.i18n.t(LOCALES.faq))
//       .text(ctx.i18n.t(LOCALES.switch_language))
//       .row()
//       .text(ctx.i18n.t(LOCALES.rules))
//       .text(ctx.i18n.t(LOCALES.help))
//       .row()
//       .text(ctx.i18n.t(LOCALES.winners))
//       .text(ctx.i18n.t(LOCALES.contacts))
//   );
// };

export const backKeyboard = (ctx: BotContext): Keyboard => {
  return new Keyboard().text(ctx.i18n.t(LOCALES.back));
};
