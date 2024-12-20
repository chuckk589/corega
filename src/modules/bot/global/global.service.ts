import { wrap } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/modules/app-config/app-config.service';
import { City } from 'src/modules/mikroorm/entities/City';
import { Config } from 'src/modules/mikroorm/entities/Config';
import { Locale, User, UserRole } from 'src/modules/mikroorm/entities/User';
import { BotContext, CheckData } from 'src/types/interfaces';
import fs from 'fs';
import axios from 'axios';
import { Check } from 'src/modules/mikroorm/entities/Check';
import { CheckState } from 'src/modules/mikroorm/entities/CheckStatus';
import { BotStep } from 'src/types/enums';

@Injectable()
export class globalService {
  constructor(private readonly em: EntityManager, private readonly AppConfigService: AppConfigService) {}
  async checkParticipation(id: number) {
    const checks = await this.em.find(Check, { user: { chatId: id.toString() }, status: { name: CheckState.APPROVED } });
    return checks.length > 0;
  }
  async clean(from: number) {
    const user = await this.em.findOneOrFail(User, { chatId: String(from) }, { populate: ['checks', 'tickets.messages'] });
    await this.em.removeAndFlush(user);
  }

  async getUserChatIds(): Promise<string[]> {
    const users = await this.em.find(User, {});
    return users.map((user) => user.chatId);
  }
  async updateUser(from: number, options: Partial<User>) {
    await this.em.nativeUpdate(User, { chatId: String(from) }, options);
  }
  async checkUserRole(from: number): Promise<boolean> {
    try {
      const user = await this.em.findOneOrFail(User, { chatId: String(from) });
      return user.role == UserRole.ADMIN;
    } catch (error) {
      return false;
    }
  }
  // async updatePromo(from: number, id: number) {
  //   await this.em.nativeUpdate(
  //     User,
  //     { chatId: String(from) },
  //     {
  //       promo: this.em.getReference(Promo, id),
  //       registered: true,
  //     },
  //   );
  // }

  async finishRegistration(ctx: BotContext) {
    //check if theres user with same phone already
    // const mainUser = await this.em.findOneOrFail(User, { chatId: String(ctx.from.id) });
    // mainUser.chatId = String(ctx.from.id);
    // mainUser.locale = ctx.session.userData.locale as Locale;
    // mainUser.phone = ctx.session.userData.phone.replace(/\D/g, '');
    // mainUser.username = ctx.from.username;
    // mainUser.credentials = ctx.session.userData.credentials;
    // mainUser.city = this.em.getReference(City, ctx.session.userData.city_id);
    // // mainUser.email = ctx.session.userData.email;
    // mainUser.registered = true;
    // await this.em.persistAndFlush(mainUser);
    const phone = ctx.session.userData.phone.replace(/\D/g, '');
    //check if theres user with same phone already and update it if so
    let user = await this.em.findOne(User, { phone });
    //сценарии
    //зарегался с сайта - phone not null chatid - null
    if (!user) {
      //user not registered from site
      //update existing
      user = await this.em.findOneOrFail(User, { chatId: String(ctx.from.id) });
    } else {
      await this.em.nativeDelete(User, { chatId: String(ctx.from.id) });
    }
    user.chatId = String(ctx.from.id);
    user.locale = ctx.session.userData.locale as Locale;
    user.username = ctx.from.username;
    user.phone = phone;
    user.credentials = ctx.session.userData.credentials;
    user.city = this.em.getReference(City, ctx.session.userData.city_id);
    user.registered = true;
    await this.em.persistAndFlush(user);
  }
  async getUser(ctx: BotContext) {
    let user = await this.em.findOne(User, { chatId: String(ctx.from.id) });
    if (!user) {
      user = this.em.create(User, {
        chatId: String(ctx.from.id),
        username: ctx.from.username,
      });
      await this.em.persistAndFlush(user);
    }
    return wrap(user).toPOJO();
  }
  downloadFile(ctx: BotContext): Promise<string> {
    return new Promise((res, rej) => {
      ctx
        .getFile() //
        .then((file) => {
          const token = this.AppConfigService.get('BOT_TOKEN_PROD');
          axios({
            url: `http://api.telegram.org/file/bot${token}/${file.file_path}`,
            method: 'GET',
            responseType: 'stream',
          }).then((response) => {
            const uploaddir = `/files/${ctx.from.id}`;
            const filename = `${Date.now()}.${file.file_path.split('.').pop()}`;
            if (!fs.existsSync(`./dist/public${uploaddir}`)) {
              fs.mkdirSync(`./dist/public${uploaddir}`, { recursive: true });
            }
            const photo = fs.createWriteStream(`./dist/public${uploaddir}/${filename}`);
            response.data.pipe(photo).on('finish', function () {
              res(`${uploaddir}/${filename}`);
            });
          });
        });
    });
  }
  async applyRequest(
    from: number,
    payload: {
      checkPath: string;
      goodPath: string;
      idPath: string;
      pinfl: string;
      cardNumber: string;
    },
  ) {
    const user = await this.em.findOneOrFail(User, { chatId: String(from) }, { populate: ['checks'] });
    const check = await this.em.findOne(Check, { user: { id: { $ne: user.id } }, $or: [{ cardNumber: payload.cardNumber }, { pinfl: payload.pinfl }] });
    if (check) {
      return { error: true };
    }
    return await this.insertNewCheck(user, payload);
  }
  async getUserAccountInfo(ctx: BotContext): Promise<Check[]> {
    const userChecks = await this.em.find(
      Check,
      { user: { chatId: String(ctx.from.id) } },
      {
        refresh: true,
        populate: ['status.comment.values', 'status.translation.values'],
      },
    );
    return userChecks;
  }
  async insertNewCheck(
    user: User,
    payload: {
      checkPath: string;
      goodPath: string;
      idPath: string;
      pinfl: string;
      cardNumber: string;
    },
  ): Promise<CheckData> {
    try {
      const check = new Check({ ...payload });
      user.checks.add(check);
      await this.em.persistAndFlush(user);
      return { error: false, fancyId: check.fancyId };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return await this.insertNewCheck(user, payload);
      }
    }
  }
  getPrevStep(currentStep: BotStep) {
    if (currentStep == BotStep.rules) {
      return BotStep.default;
    }
  }
}
// export enum BotStep {
//   default = 'default',
//   rules = 'rules',
//   phone = 'phone',
//   age = 'age',
//   resident = 'resident',
//   name = 'name',
//   city = 'city',
//   faq = 'faq',
//   faq1 = 'faq1',
//   faq2 = 'faq2',
//   //participate
//   pStep1 = 'pStep1',
//   pStep2 = 'pStep2', // check
//   pStep3 = 'pStep3', // id path
//   pStep4 = 'pStep4', // pinfl
//   pStep5 = 'pStep5', // card number
//   pStep6 = 'pStep6', // account number
//   tickets = 'tickets',
//   ticketsEdit = 'ticketsEdit',
//   ticketsCreate = 'ticketsCreate',
