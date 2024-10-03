import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Config } from '../entities/Config';
import { Promo } from '../entities/Promo';
import { Translation } from '../entities/Translation';
import { Locale, User, UserRole } from '../entities/User';
import { City } from '../entities/City';
import { CheckState, CheckStatus } from '../entities/CheckStatus';
import { LotteryState, LotteryStatus } from '../entities/LotteryStatus';
import { Prize } from '../entities/Prize';
import { PrizeValue } from '../entities/PrizeValue';

export class ConfigSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    em.create(Config, {
      name: 'ADMIN_PASSCODE',
      value: '$2a$12$rok.MCu02SSWKkSuTRhwdudPl4N6QQl0sRRBf1vyTaxLiw14TwR6i',
    });
    em.create(Config, {
      name: 'BOT_TOKEN_PROD',
      value: '1863509702:AAGBObPLJYd17777K26x0s1vsG8fva3NCag',
    });
    em.create(User, {
      username: 'admin',
      chatId: '123456789',
      role: UserRole.ADMIN,
    });
    let translationId = 1;
    // for (let i = 0; i < promos.length; i++) {
    //   em.create(Promo, {
    //     name: 'PROMO_' + (i + 1),
    //     translation: em.create(Translation, {
    //       id: translationId,
    //       name: 'PROMO_' + (i + 1),
    //       values: [
    //         { code: Locale.RU, value: promos[i].ru, translation: translationId },
    //         { code: Locale.UZ, value: promos[i].uz, translation: translationId },
    //       ],
    //     }),
    //   });
    //   translationId++;
    // }

    for (let i = 0; i < cities.length; i++) {
      em.create(City, {
        name: 'CITY_' + (i + 1),
        translation: em.create(Translation, {
          id: translationId,
          name: 'CITY_' + (i + 1),
          values: [
            { code: Locale.RU, value: cities[i].ru, translation: translationId },
            { code: Locale.UZ, value: cities[i].uz, translation: translationId },
          ],
        }),
      });
      translationId++;
    }

    const comment = em.create(Translation, {
      id: translationId,
      name: 'REJECTED',
      values: [
        { code: Locale.RU, value: 'Отклонен' },
        { code: Locale.UZ, value: 'Rad etilgan' },
      ],
    });
    translationId++;

    for (let i = 0; i < checkstatuses.length; i++) {
      em.create(CheckStatus, {
        name: checkstatuses[i].stat,
        translation: em.create(Translation, {
          id: translationId,
          name: checkstatuses[i].key,
          values: [
            { code: Locale.RU, value: checkstatuses[i].ru, translation: translationId },
            { code: Locale.UZ, value: checkstatuses[i].uz, translation: translationId },
          ],
        }),
        comment: checkstatuses[i].stat == CheckState.REJECTED ? comment : null,
      });
      translationId++;
    }

    for (let i = 0; i < lotterystatus.length; i++) {
      em.create(LotteryStatus, {
        name: lotterystatus[i].stat,
        translation: em.create(Translation, {
          id: translationId,
          name: lotterystatus[i].stat,
          values: [
            { code: Locale.RU, value: lotterystatus[i].ru, translation: translationId },
            { code: Locale.UZ, value: lotterystatus[i].ru, translation: translationId },
          ],
        }),
      });
      translationId++;
    }
    em.create(PrizeValue, { name: 'PRIZE_WEEKLY_1', value: 'Колонка JBL Xtreme 4 BT' });
    em.create(PrizeValue, { name: 'PRIZE_WEEKLY_2', value: 'Проектор Nebula Mars 3 Ai' });
    em.create(PrizeValue, { name: 'PRIZE_WEEKLY_3', value: 'Набор «Понедельник – день чилловый»' });
    em.create(PrizeValue, { name: 'PRIZE_WEEKLY_4', value: 'Беспроводные наушники JBL Tour One M2' });
    em.create(PrizeValue, { name: 'PRIZE_MAIN_1', value: 'Главный приз' });
    em.create(Prize, {
      name: 'PRIZE_WEEKLY_CHECKS',
      translation: em.create(Translation, {
        id: translationId,
        name: 'Weekly_1',
        values: [{ code: Locale.RU, value: 'Еженедельный приз (Чеки)', translation: translationId }],
      }),
    });
    translationId++;
    em.create(Prize, {
      name: 'PRIZE_WEEKLY_BARCODES',
      translation: em.create(Translation, {
        id: translationId,
        name: 'Weekly_2',
        values: [{ code: Locale.RU, value: 'Еженедельный приз (Штрихкоды)', translation: translationId }],
      }),
    });
    translationId++;

    em.create(Prize, {
      name: 'PRIZE_WEEKLY_ALL',
      translation: em.create(Translation, {
        id: translationId,
        name: 'Weekly_3',
        values: [{ code: Locale.RU, value: 'Еженедельный приз (Все)', translation: translationId }],
      }),
    });
    translationId++;

    em.create(Prize, {
      name: 'PRIZE_MAIN',
      translation: em.create(Translation, {
        id: translationId,
        name: 'Main',
        values: [{ code: Locale.RU, value: 'Главный приз', translation: translationId }],
      }),
    });
  }
}

// const promos = [
//   { ru: '* Увидел(-а) в рекламе', uz: '* Жарнамадан көрдім' },
//   { ru: '* От продавца в магазине', uz: '* Дүкендегі сатушыдан' },
//   { ru: '* TV', uz: '* TV' },
//   { ru: '* другое', uz: '* басқа' },
// ];

const cities = [
  { ru: 'Ташкент', uz: 'Toshkent' },
  { ru: 'Андижан', uz: 'Andijon' },
  { ru: 'Бухара', uz: 'Buxoro' },
  { ru: 'Гулистан', uz: 'Guliston' },
  { ru: 'Джизак', uz: 'Jizzax' },
  { ru: 'Карши', uz: 'Qarshi' },
  { ru: 'Навои', uz: 'Navoiy' },
  { ru: 'Наманган', uz: 'Namangan' },
  { ru: 'Нукус', uz: 'Nukus' },
  { ru: 'Самарканд', uz: 'Samarqand' },
  { ru: 'Термез', uz: 'Termiz' },
  { ru: 'Ургенч', uz: 'Urganch' },
  { ru: 'Фергана', uz: "Farg'ona" },
  { ru: 'Другое', uz: 'Boshqalar' },
];
// Нечеткие изображения
// Нечеткая фотография чека
// Нечеткая фотография товара
// Нечеткая фотография удостоверения
// Неверные банковские данные
// Неверный ПИНФЛ
//ФИО в удостоверении не соответствует ФИО банковской карты
//Пользователю был одобрен возврат ранее (повторный возврат средств невозможен)
const checkstatuses = [
  { ru: 'Ожидает проверки', uz: 'Қарауды күтуде', key: 'MODERATED', stat: CheckState.MODERATED },
  {
    ru: 'Нечеткие изображения',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_1',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Неверные банковские данные',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_2',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Неверный ПИНФЛ',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_3',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Нечеткая фотография чека',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_4',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Нечеткая фотография товара',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_5',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Нечеткая фотография удостоверения',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_6',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'ФИО в удостоверении не соответствует ФИО банковской карты',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_7',
    stat: CheckState.REJECTED,
  },
  {
    ru: 'Возврат средств уже был оформлен',
    uz: 'No translation / Не принят',
    key: 'REJECT_REASON_8',
    stat: CheckState.REJECTED,
  },
  // {
  //   ru: 'Отсутствуют необходимые SKU',
  //   uz: 'No translation / Отсутствуют необходимые SKU',
  //   key: 'REJECT_REASON_1',
  //   stat: CheckState.REJECTED,
  // },
  // {
  //   ru: 'Чек не читабелен',
  //   uz: 'No translation / Чек не читабелен',
  //   key: 'REJECT_REASON_2',
  //   stat: CheckState.REJECTED,
  // },
  // {
  //   ru: 'Загружено не фото чека',
  //   uz: 'No translation / Загружено не фото чека',
  //   key: 'REJECT_REASON_3',
  //   stat: CheckState.REJECTED,
  // },
  // {
  //   ru: 'Чек был загружен ранее',
  //   uz: 'No translation / Чек был загружен ранее',
  //   key: 'REJECT_REASON_4',
  //   stat: CheckState.REJECTED,
  // },
  // {
  //   ru: 'Кол-во продукции не соответствует чеку',
  //   uz: 'No translation / Кол-во продукции не соответствует чеку',
  //   key: 'REJECT_REASON_5',
  //   stat: CheckState.REJECTED,
  // },
  { ru: 'Подтвержден', key: 'STATUS_APPROVED', stat: CheckState.APPROVED, uz: 'Расталды' },
];
const lotterystatus = [
  { ru: 'Ожидает розыгрыша', stat: LotteryState.PENDING },
  { ru: 'Проведена', stat: LotteryState.ENDED },
];
