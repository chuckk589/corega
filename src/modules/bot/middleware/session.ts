import { session as session_ } from 'grammy';
import { BotStep } from 'src/types/enums';
import { Session, BotContext } from 'src/types/interfaces';

const initial = (): Session => ({
  menuId: undefined,
  bulkId: undefined,
  step: BotStep.default,
  isRegistered: undefined,
  userData: { tickets: { data: [], currentIndex: 0 }, check: { checkPath: '', goodPath: '', idPath: '', pinfl: '', cardNumber: '', accountNumber: '' } },
});

function getSessionKey(ctx: BotContext): string | undefined {
  return ctx.from?.id.toString();
}

export const session = session_({
  initial: initial,
  getSessionKey: getSessionKey,
});
