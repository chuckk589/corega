import { Api, Composer, Context, SessionFlavor } from 'grammy';
import { I18nContext, I18nContextFlavor, TemplateData } from '@grammyjs/i18n';
import { MenuControlPanel, MenuFlavor } from '@grammyjs/menu';
import { match } from 'src/modules/bot/common/helpers';
import { ModuleMetadata } from '@nestjs/common';
import { BotStep } from './enums';
import { Locale, User } from 'src/modules/mikroorm/entities/User';
import { Notification } from 'src/modules/mikroorm/entities/Notification';
import { globalComposer } from 'src/modules/bot/global/global.composer';
// import { Promo } from 'src/modules/mikroorm/entities/Promo';
import { EntityDTO } from '@mikro-orm/core';
import { BotLotteryDto, Lottery } from 'src/modules/mikroorm/entities/Lottery';
import { InputFile, Message, Update, UserFromGetMe } from 'grammy/out/types.node';
import { RetrieveTicketDto } from 'src/modules/ticket/dto/retrieve-ticket.dto';
import { LOCALES } from 'src/modules/bot/common/constants';

type I18nContextMapped = Omit<I18nContext, 't'> & { t(resourceKey: LOCALES, templateData?: Readonly<TemplateData>): string };
type I18nContextMappedFlavor = { readonly i18n: I18nContextMapped };
export class BotContext extends Context implements SessionFlavor<Session>, I18nContextMappedFlavor, MenuFlavor {
  constructor(update: Update, api: Api, me: UserFromGetMe) {
    super(update, api, me);
    // this.cleanAndReply = async (text: string, other?: any, signal?: any) => {
    //   await this.clean();
    //   return this.reply(text, other, signal);
    // };
    // this.replyAndSave = async (text: string, other?: any, signal?: any) => {
    //   await this.reply(text, other, signal).then((r) => (this.session.menuId = r.message_id));
    // };
    // this.cleanReplySave = async (text: string, other?: any, signal?: any) => {
    //   await this.clean();
    //   await this.replyAndSave(text, other, signal);
    // };
    // this.clean = async () => {
    //   if (this.session.menuId) {
    //     await this.api.deleteMessage(this.from.id, this.session.menuId).catch(() => {});
    //     this.session.menuId = undefined;
    //   }
    // };
    // this.save = async (messageId: number) => {
    //   this.session.menuId = messageId;
    // };
  }
  menu: MenuControlPanel;
  i18n: I18nContextMapped;
  match: string;
  // lastMessageId: number;
  // async execute<T extends keyof Context>(methodName: T, payload?: any) {
  //   await (this[methodName] as any)(...payload).catch(() => {});
  //   return this;
  // }
  async clean() {
    if (this.session.menuId) {
      await this.api.deleteMessage(this.from.id, this.session.menuId).catch(() => {});
      this.session.menuId = undefined;
    }
  }
  async save(messageId: number) {
    this.session.menuId = messageId;
  }
  // clean: () => any;
  // cleanAndReply: (text: string, other?: any, signal?: AbortSignal) => Promise<Message.TextMessage>;
  // replyAndSave: (text: string, other?: any, signal?: AbortSignal) => Promise<void>;
  // cleanReplySave: (text: string, other?: any, signal?: AbortSignal) => Promise<void>;
  // cleanAndMethod<T extends Method>(method: T, payload: MethodPayload<T>): Promise<Message> {
  //   return this.clean().then(() => {
  //     if (method == 'replyWithPhoto') {
  //       const _payload = payload as MethodPayload<'replyWithPhoto'>;
  //       return this.replyWithPhoto(_payload.photo, _payload.other);
  //     }
  //   });
  // }
  // cleanReplySaveAndMethod<T extends Method>(method: T, payload: MethodPayload<T>): any {
  //   return this.cleanAndMethod(method, payload).then((r) => (this.session.menuId = r.message_id));
  // }
  // save: (messageId: number) => void;

  get session(): Session {
    throw new Error('Method not implemented.');
  }
  set session(session: Session) {
    throw new Error('Method not implemented.');
  }

  get currentTicket(): RetrieveTicketDto {
    return this.session.userData.tickets.data[this.session.userData.tickets.currentIndex];
  }
  setNextTicket(): void {
    this.session.userData.tickets.currentIndex = this.session.userData.tickets.currentIndex + 1 >= this.session.userData.tickets.data.length ? 0 : this.session.userData.tickets.currentIndex + 1;
  }
  setPrevTicket(): void {
    console.log(this.session.userData.tickets.data.length);
    this.session.userData.tickets.currentIndex = this.session.userData.tickets.currentIndex - 1 < 0 ? this.session.userData.tickets.data.length - 1 : this.session.userData.tickets.currentIndex - 1;
  }
}

export interface Session {
  bulkId: number;
  menuId: number;
  // checkCount: number;
  step: BotStep;
  isRegistered: boolean;
  // winners: BotLotteryDto[];
  userData: {
    check: {
      checkPath: string;
      goodPath: string;
      idPath: string;
      pinfl: string;
      cardNumber: string;
      accountNumber: string;
    };
    tickets: {
      data: RetrieveTicketDto[];
      currentIndex: number;
    };
    // email?: string;
    locale?: string;
    phone?: string;
    // address?: string;
    // passport?: string;
    credentials?: string;
    city_id?: number;
    // promo_id?: number;
  };
}

export type CheckData = { error: boolean; fancyId?: string };

export class TranslatableConfig {
  constructor(payload: { id: number; name: string; translation: any }) {
    this.id = payload.id;
    this.key = payload.name;
    this.translation = payload.translation.getAllLabels();
  }
  id: number;
  key: string;
  translation: { [key in Locale]: string };
}
export class BaseComposer {
  protected _composer: Composer<any>;
  getMiddleware(): Composer<any> {
    return this._composer;
  }
}
export interface GrammyBotOptions {
  token: string;
  middleware?: any[];
}
export interface GrammyBotOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<GrammyBotOptions> | GrammyBotOptions;
  inject?: any[];
}
export interface QueueEntity {
  id: number;
  interval: ReturnType<typeof setInterval>;
  adminsOnly?: boolean;
  notification?: Notification;
}
