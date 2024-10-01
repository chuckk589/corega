import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { FlowProducer, Job } from 'bullmq';
import { Bot } from 'grammy';
import { BOT_NAME, NOTIF_TG, NOTIF_TG_CHILD } from 'src/constants';
import { BotContext } from 'src/types/interfaces';
import { NotificationJobPayload, NotificationType } from '../services/notification-flow.service';
import cache from '../../bot/common/cache';
import { Message } from 'grammy/types';
import { InputFile } from 'grammy';

@Processor(NOTIF_TG_CHILD)
export class NotificationConsumerChild extends WorkerHost {
  constructor(@Inject(BOT_NAME) private bot: Bot<BotContext>) {
    super();
  }
  async process(job: Job<NotificationJobPayload<NotificationType> & { recipient: string }, void, string>): Promise<any> {
    console.log(`NOTIF_TG_CHILD process`);
    try {
      if (job.data.method === 'sendMediaGroup') {
        const payload = job.data.payload as NotificationJobPayload<'sendMediaGroup'>['payload'];
        // TODO: rework so payload.media is actually media not local path
        await this.bot.api
          .sendMediaGroup(
            job.data.recipient,
            payload.media.map((m) => ({ ...m, media: cache.resolveImage(m.media as any) })),
          )
          .then((res: Message.PhotoMessage[]) => {
            res.map((m, index) => cache.cacheAsset(payload.media[index].media as any, m));
          });
      } else if (job.data.method === 'sendPhoto') {
        const payload = job.data.payload as NotificationJobPayload<'sendPhoto'>['payload'];
        await this.bot.api.sendPhoto(job.data.recipient, cache.resolveImage(payload.imagePath), { caption: payload.caption, reply_markup: payload.buttons }).then((res: Message.PhotoMessage) => {
          cache.cacheAsset(payload.imagePath, res);
        });
      } else if (job.data.method === 'sendMessage') {
        const payload = job.data.payload as NotificationJobPayload<'sendMessage'>['payload'];
        await this.bot.api.sendMessage(job.data.recipient, payload.caption, { reply_markup: payload.buttons });
      } else if (job.data.method === 'sendAnimation') {
        const payload = job.data.payload as NotificationJobPayload<'sendAnimation'>['payload'];
        await this.bot.api.sendAnimation(job.data.recipient, cache.resolveImage(payload.imagePath), { caption: payload.caption, reply_markup: payload.buttons }).then((res: Message.AnimationMessage) => {
          cache.cacheAsset(payload.imagePath, res);
        });
        return true;
      } else if (job.data.method === 'sendVideo') {
        const payload = job.data.payload as NotificationJobPayload<'sendVideo'>['payload'];
        await this.bot.api.sendVideo(job.data.recipient, cache.resolveImage(payload.imagePath), { caption: payload.caption, reply_markup: payload.buttons }).then((res: Message.VideoMessage) => {
          cache.cacheAsset(payload.imagePath, res);
        });
      }
    } catch (error) {
      console.log(error);
      if (error.error_code == 403 || job.opts.attempts == job.attemptsMade + 1) return false;
      throw error;
    }
  }
}
