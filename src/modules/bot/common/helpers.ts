import { Check } from 'src/modules/mikroorm/entities/Check';
import { BotLotteryDto, Lottery } from 'src/modules/mikroorm/entities/Lottery';
import { Locale } from 'src/modules/mikroorm/entities/User';
import { BotContext, CheckData } from 'src/types/interfaces';
import i18n from '../middleware/i18n';
import { CheckState } from 'src/modules/mikroorm/entities/CheckStatus';
import { LOCALES } from './constants';

export function match(key: string): RegExp {
  const locales: string[] = i18n.availableLocales();
  const emojiRegex = /\p{Emoji}/u;
  const regex = new RegExp(
    locales
      .map((l) => {
        let value = `^${i18n.t(l, key)}$`;
        if (emojiRegex.test(value)) {
          value += `|${value.replace(emojiRegex, '')}`;
        }
        return value;
      })
      .join('|'),
  );
  return regex;
}

export const label = (payload: { text: LOCALES; payload?: string }) => {
  return (ctx: BotContext) => ctx.i18n.t(payload.text);
};

// export const checkMessage = (ctx: BotContext, checks: Check[]): string => {
//   if (!checks.length) return ctx.i18n.t(LOCALES.no_checks);
//   const locale = ctx.i18n.locale() as Locale;
//   const message = checks.reduce((s, c) => {
//     s += `\n${c.fancyId} - ${c.status.translation.getLocalizedLabel(locale)}`;
//     return s;
//   }, ctx.i18n.t(LOCALES.my_checks));
//   return message;
// };

// export const accountMessage = (ctx: BotContext, checks: Check[]): string => {
//   const locale = ctx.i18n.locale() as Locale;
//   let message = ctx.i18n.t(LOCALES.my_checks);
//   if (!checks.length) {
//     message += '\n' + ctx.i18n.t(LOCALES.no_checks) + '\n' + ctx.i18n.t(LOCALES.my_prizes) + '\n' + ctx.i18n.t(LOCALES.no_prizes);
//     return message;
//   }
//   checks.forEach((c) => {
//     message += `\n${c.fancyId} - ${c.status.comment ? c.status.comment.getLocalizedLabel(locale) : c.status.translation.getLocalizedLabel(locale)}`;
//   });
//   message += '\n' + ctx.i18n.t(LOCALES.my_prizes);

//   let won = false;
//   checks.forEach((c) => {
//     const winners = c.winners.getItems();
//     if (winners.length) {
//       won = true;
//       winners.forEach((w) => {
//         message += `\n${w.check.fancyId} - ${ctx.i18n.t(w.prizeValue.name)}`;
//       });
//     }
//   });
//   if (!won) message += '\n' + ctx.i18n.t(LOCALES.no_prizes);

//   return message;
// };

export const composeMyTicketMessage = (ctx: BotContext): string => {
  const ticketNum = ctx.session.userData.tickets.currentIndex;
  const currentTicket = ctx.session.userData.tickets.data[ticketNum];
  const lastmessage = currentTicket.history[currentTicket.history.length - 1];
  const content =
    `${ctx.i18n.t(LOCALES.ticket_object)}: ${currentTicket.object}\n` +
    `${ctx.i18n.t(LOCALES.ticket_date)}: ${new Date(currentTicket.createdAt).toLocaleString()}\n` +
    `${ctx.i18n.t(LOCALES.ticket_status)}: ${ctx.i18n.t(currentTicket.status as any)}\n` +
    `${lastmessage ? ctx.i18n.t(LOCALES.ticket_last_message) + '\n' + `[${new Date(lastmessage.createdAt).toLocaleString()}] ${lastmessage.user}: ${lastmessage.message}\n` : ''}\n`;
  const total = `(${ticketNum + 1}/${ctx.session.userData.tickets.data.length})`;
  const message = `${total}\n\n` + content;
  return message;
};

export const prizeMessage = (ctx: BotContext, lotteries: Lottery[]): string => {
  if (!lotteries.length) return ctx.i18n.t(LOCALES.no_prizes);
  const locale = ctx.i18n.locale() as Locale;
  const message = lotteries.reduce((s: string, c: Lottery) => {
    c.winners.toArray().forEach((w) => {
      s += `\n${w.check.fancyId} - ${c.prize.translation.getLocalizedLabel(locale)}`;
    });
    return s;
  }, ctx.i18n.t(LOCALES.my_prizes));
  return message;
};

// export const winnersMessage = (ctx: BotContext): string => {
//   return ctx.session.winners.length ? ctx.i18n.t(LOCALES.winners) : ctx.i18n.t(LOCALES.no_winners_yet);
// };

// export const prizeMessageWeek = (ctx: BotContext, week: number): string => {
//   if (!ctx.session.winners.length) return ctx.i18n.t(LOCALES.no_winners_yet);
//   const winners = ctx.session.winners.filter((w) => w.week === week);
//   return winners.reduce((s: string, c: BotLotteryDto, index: number) => {
//     s += `${ctx.i18n.t(c.prize + '_H')}\n`;
//     c.winners.forEach((w) => {
//       s += `\n${c.date} - ${ctx.i18n.t(w.prizeKey)} - ${w.phone}`;
//     });
//     if (index < winners.length - 1) s += '\n\n▫️▫️▫️▫️▫️▫️▫️▫️\n\n';
//     return s;
//   }, '');
// };

// export const checkMessageByCount = (ctx: BotContext, check: CheckData): string => {
//   const translationKey = check.checkCount < 6 ? `checkAccepted_${check.checkCount}` : 'checkAccepted';
//   return ctx.i18n.t(translationKey, { id: check.fancyId, count: check.checkCount });
// };

export const getRandomArrayValues = (arr: any[], count: number): any[] => {
  const shuffled = arr.slice(0);
  const result: any[] = [];
  while (result.length < count) {
    const random = Math.floor(Math.random() * shuffled.length);
    //ensure user can't win twice
    if (result.some((r) => r.user.id === shuffled[random].user.id)) continue;
    result.push(shuffled[random]);
    shuffled.splice(random, 1);
  }
  return result;
};
