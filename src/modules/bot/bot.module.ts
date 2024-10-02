import { Module, DynamicModule, Inject, Provider, Global } from '@nestjs/common';
import { Bot, Context, GrammyError, HttpError } from 'grammy';
import { BOT_NAME, BOT_OPTIONS } from 'src/constants';
import { BotStep } from 'src/types/enums';
import { BotContext, GrammyBotOptions, GrammyBotOptionsAsync } from 'src/types/interfaces';
import fs from 'fs';
import path from 'path';
import { LOCALES } from './common/constants';

@Global()
@Module({})
export class BotModule {
  public static forRootAsync(options: GrammyBotOptionsAsync): DynamicModule {
    const BotProvider: Provider = {
      provide: BOT_NAME,
      useFactory: async (options: GrammyBotOptions) => await this.createBotFactory(options),
      inject: [BOT_OPTIONS],
    };
    const BotOptionsProvider: Provider = {
      provide: BOT_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
    return {
      module: BotModule,
      imports: options.imports,
      providers: [BotProvider, BotOptionsProvider],
      exports: [BotProvider, BotOptionsProvider],
    };
  }
  static async createBotFactory(options: GrammyBotOptions): Promise<Bot<BotContext>> {
    const bot = new Bot<BotContext>(options.token, { ContextConstructor: BotContext });

    options.middleware?.map((middleware) => bot.use(middleware));
    bot.api.setMyCommands([
      { command: 'start', description: 'Начать' },
      { command: 'menu', description: 'Главное меню' },
      { command: 'rules', description: 'Правила' },
      { command: 'contacts', description: 'Обратная связь' },
    ]);
    checkLocalesKeys();
    bot.start();
    return bot;
  }
}
function checkLocalesKeys() {
  // const ruLocale = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../bot/locales/ru.json'), 'utf-8'));
  // const keys = Object.keys(ruLocale);
  // const hardKeys = Object.keys(LOCALES);
  // const missingKeys = hardKeys.filter((key) => !keys.includes(key));
  // const extraKeys = keys.filter((key) => !hardKeys.includes(key));
  // if (missingKeys.length) {
  //   console.log('Missing keys:', missingKeys);
  // }
  // if (extraKeys.length) {
  //   console.log('Extra keys json:', extraKeys);
  // }

  //camelcase to underscore
  // const camelCaseKeys = keys.filter((key) => !key.includes('_'));
  // const rest = keys.filter((key) => key.includes('_'));
  // const noCamelCaseKeys = camelCaseKeys.reduce((acc: any, key) => {
  //   const _key = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  //   acc[_key] = ruLocale[key];
  //   return acc;
  // }, {});
  // rest.forEach((key) => {
  //   noCamelCaseKeys[key] = ruLocale[key];
  // });
  // fs.writeFileSync(path.resolve(__dirname, '../bot/locales/_ru.json'), JSON.stringify(noCamelCaseKeys, null, 2));

  //sort keys aplhabetically but parse numbers as numbers
  // const sortedKeys = keys.sort((a, b) => {
  //   const aNum = parseInt(a.match(/\d+/)?.[0]);
  //   const bNum = parseInt(b.match(/\d+/)?.[0]);
  //   if (aNum && bNum) {
  //     return aNum - bNum;
  //   }
  //   return a.localeCompare(b);
  // });
  // fs.writeFileSync(
  //   path.resolve(__dirname, '../bot/locales/ru.json'),
  //   JSON.stringify(
  //     sortedKeys.reduce((acc: any, key) => {
  //       acc[key] = ruLocale[key];
  //       return acc;
  //     }, {}),
  //     null,
  //     2,
  //   ),
  // );

  const keys = Object.keys(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../bot/locales/uz.json'), 'utf-8')));
  const keys2 = Object.keys(JSON.parse(fs.readFileSync(path.resolve(__dirname, '../bot/locales/_uz.json'), 'utf-8')));
  const overlappingKeys = keys.filter((key) => keys2.includes(key));
  console.log('Overlapping keys:', overlappingKeys);
  // const oldKeys = Object.keys(locale);
  // const camelCaseKeys = oldKeys.filter((key) => !key.includes('_'));
  // const rest = oldKeys.filter((key) => key.includes('_'));
  // const noCamelCaseKeys = camelCaseKeys.reduce((acc: any, key) => {
  //   const _key = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  //   acc[_key] = locale[key];
  //   return acc;
  // }, {});
  // rest.forEach((key) => {
  //   noCamelCaseKeys[key] = locale[key];
  // });
  // fs.writeFileSync(path.resolve(__dirname, '../bot/locales/_uz.json'), JSON.stringify(noCamelCaseKeys, null, 2));
}
