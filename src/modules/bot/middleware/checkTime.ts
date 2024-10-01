import { NextFunction } from 'grammy';
import { BotContext } from 'src/types/interfaces';

const preventOldUpdates = Date.now() / 1000;

export default async function (ctx: BotContext, next: NextFunction): Promise<void> {
  try {
    const date: number = ctx.msg?.date;
    if (date) {
      if (preventOldUpdates < ctx.msg.date) {
        await next();
      }
    } else {
      await next();
    }
  } catch (error) {
    console.log(error);
  }
}
