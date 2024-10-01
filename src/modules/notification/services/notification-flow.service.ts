import { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { FlowChildJob, FlowProducer, Job } from 'bullmq';
import { InlineKeyboardMarkup, InputMediaPhoto } from 'grammy/types';
import { NOTIF_TG, NOTIF_TG_CHILD, NOTIF_TG_PRODUCER } from 'src/constants';
import { Notification } from 'src/modules/mikroorm/entities/Notification';
import { Locale, User, UserRole } from 'src/modules/mikroorm/entities/User';
import fs from 'fs';
export enum NOTIFICATION_STATE {
  TEST = 'TEST',
  DEFAULT = 'DEFAULT',
}
export type NotificationFlowData = { notificationId: number };

export type NotificationJobPayload<T extends NotificationType> = { payload: NotificationPayload<T>; method: T };
export type NotificationPayload<T extends NotificationType> = T extends 'sendMediaGroup'
  ? { media: ReadonlyArray<InputMediaPhoto> }
  : T extends 'sendPhoto' | 'sendAnimation' | 'sendVideo'
  ? { imagePath: string; caption: string; buttons: InlineKeyboardMarkup }
  : T extends 'sendMessage'
  ? { caption: string; buttons: InlineKeyboardMarkup }
  : never;
export type NotificationType = 'sendMediaGroup' | 'sendPhoto' | 'sendMessage' | 'sendAnimation' | 'sendVideo';

@Injectable()
export class NotificationFlowService {
  constructor(@InjectFlowProducer(NOTIF_TG_PRODUCER) private notifyProducer: FlowProducer, private readonly em: EntityManager) {}

  async createParentFlow(notification: Notification, type: NOTIFICATION_STATE): Promise<string> {
    const flow = await this.notifyProducer.add(
      {
        name: 'tg_parent',
        queueName: NOTIF_TG,
        children: await this.createChildren(notification, type),
        data: {
          notificationId: notification.id,
        },
      },
      {
        queuesOptions: {
          [NOTIF_TG]: {
            defaultJobOptions: {
              removeOnComplete: true,
              removeOnFail: true,
            },
          },
          [NOTIF_TG_CHILD]: {
            defaultJobOptions: {
              attempts: 2,
              backoff: {
                type: 'exponential',
                delay: 10000,
              },
              removeOnComplete: true,
              removeOnFail: true,
            },
          },
        },
      },
    );
    return flow.job.id || '';
  }
  async createChildren(notification: Notification, type: NOTIFICATION_STATE) {
    const recipients = await this.em.find(User, this.resolveWhereQuery(type == NOTIFICATION_STATE.TEST, notification.checkOwnersOnly, notification.registeredOnly), { populate: ['checks'] });
    return recipients.map((recipient: User) => {
      return {
        name: 'tg_child',
        queueName: NOTIF_TG_CHILD,
        data: {
          ...this.composeTgPayload(notification, recipient.locale),
          recipient: recipient.chatId,
        },
      };
    });
  }

  private resolveWhereQuery(isTest: boolean, checkOwnersOnly: boolean, registeredOnly: boolean): FilterQuery<User> {
    const where: any = { chatId: { $ne: null } };
    if (isTest) {
      where['role'] = { $eq: UserRole.ADMIN };
    } else {
      if (checkOwnersOnly) {
        where['checks'] = { $ne: null };
      }
      if (registeredOnly) {
        where['registered'] = { $eq: true };
      }
    }
    return where;
  }
  private composeText(text: string, templateKey?: string): { ru: string; uz: string } {
    const output = { ru: '', uz: '' };
    if (templateKey) {
      const ru = JSON.parse(fs.readFileSync('./dist/modules/bot/locales/ru.json', 'utf8'));
      const uz = JSON.parse(fs.readFileSync('./dist/modules/bot/locales/uz.json', 'utf8'));
      output.ru = ru[templateKey];
      output.uz = uz[templateKey];
    } else {
      output.ru = text;
      output.uz = text;
    }
    return output;
  }
  private composeTgPayload(notification: Notification, locale: Locale): NotificationJobPayload<NotificationType> {
    const imagePaths = notification.getImagePaths();
    const method = this.methodResolver(imagePaths);
    const caption = this.composeText(notification.text, notification.templateKey);
    const url = process.env.url;
    //determine which method to use depending on image existence
    //images exist and more than one  -> sendMediaGroup, no buttons
    if (method == 'sendMediaGroup') {
      return {
        payload: {
          media: imagePaths.map((imagePath, index) => ({
            type: 'photo',
            ...(index === 0 ? { caption: caption[locale || 'ru'] } : {}),
            media: imagePath,
            parse_mode: 'Markdown',
          })),
        },
        method,
      };
    }
    //exactly one image -> sendPhoto
    else if (method == 'sendPhoto' || method == 'sendAnimation' || method == 'sendVideo') {
      return {
        payload: {
          imagePath: imagePaths[0],
          caption: caption[locale || 'ru'],
          buttons: notification.getButtons(),
        },
        method,
      };
    }
    //no image -> sendMessage
    else if (method == 'sendMessage') {
      return {
        payload: {
          caption: caption[locale || 'ru'],
          buttons: notification.getButtons(),
        },
        method,
      };
    }
  }
  private methodResolver(imagePaths: string[]): NotificationType {
    if (imagePaths.length && imagePaths.length > 1) {
      return 'sendMediaGroup';
    } else if (imagePaths.length && imagePaths.length === 1) {
      if (imagePaths[0].includes('.gif')) return 'sendAnimation';
      if (imagePaths[0].includes('.mp4')) return 'sendVideo';
      return 'sendPhoto';
    } else {
      return 'sendMessage';
    }
  }
  // private getImagePaths(paths: string): string[] {
  //   const parsed = JSON.parse(paths || '[]');
  //   return parsed.length ? parsed : [];
  // }
  // private getButtons(btns?: string): InlineKeyboardMarkup {
  //   const parsed = JSON.parse(btns || '[]');
  //   const buttons = parsed.reduce(
  //     (acc: any, button: parsedButton) => {
  //       acc.inline_keyboard[button.row] = acc.inline_keyboard[button.row] || [];
  //       acc.inline_keyboard[button.row].push({ url: button.url, text: button.text });
  //       return acc;
  //     },
  //     { inline_keyboard: [] },
  //   );
  //   buttons.inline_keyboard = buttons.inline_keyboard.filter((row: any) => row.length);
  //   return buttons;
  // }
}
