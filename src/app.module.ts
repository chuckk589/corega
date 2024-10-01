import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './modules/app-config/app-config.module';
import { BotModule } from './modules/bot/bot.module';
import { MikroORM } from '@mikro-orm/core';
import { Config } from './modules/mikroorm/entities/Config';
import { globalComposer } from './modules/bot/global/global.composer';
import { globalModule } from './modules/bot/global/global.module';
import { BaseComposer } from './types/interfaces';
import checkTime from './modules/bot/middleware/checkTime';
import i18n from './modules/bot/middleware/i18n';
import { session } from './modules/bot/middleware/session';
// import { AccountModule } from './modules/bot/account/account.module';
// import { AccountComposer } from './modules/bot/account/account.composer';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CheckModule } from './modules/check/check.module';
// import { LotteryModule } from './modules/lottery/lottery.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { StatusModule } from './modules/status/status.module';
// import { WinnerModule } from './modules/winner/winner.module';
import { NotificationModule } from './modules/notification/notification.module';
import ORMOptionsProvider from 'src/configs/mikro-orm.config';
import * as Joi from 'joi';
import { TicketModule } from './modules/ticket/ticket.module';
import { BullModule } from '@nestjs/bullmq';
import { RedisConnectionOptions } from './configs/redis.config';

@Module({
  imports: [
    AppConfigModule.forRootAsync({
      validationSchema: Joi.object({
        jwt_secret: Joi.string().required(),
        NODE_ENV: Joi.string().valid('dev', 'prod'),
        PORT: Joi.number().default(3000),
        DB_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_URL: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_HOST: Joi.string().required(),
      }),
    }),
    MikroOrmModule.forRoot(ORMOptionsProvider),
    BotModule.forRootAsync({
      imports: [globalModule],
      inject: [MikroORM, globalComposer],
      useFactory: async (orm: MikroORM, ...composers: BaseComposer[]) => {
        const config = await orm.em.findOne(Config, {
          name: 'BOT_TOKEN_PROD',
        });
        return {
          token: config.value,
          middleware: [session, checkTime, i18n.middleware(), ...composers.map((c) => c.getMiddleware())],
        };
      },
    }),
    BullModule.forRoot({
      connection: RedisConnectionOptions,
      // prefix: 'bull',
      // defaultJobOptions: {
      //   removeOnComplete: true,
      //   removeOnFail: true,
      // },
    }),
    LoggerModule.forRoot({ pinoHttp: { autoLogging: false } }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, './', 'public/') }),
    UserModule,
    // LotteryModule,
    CheckModule,
    AuthModule,
    StatusModule,
    // WinnerModule,
    TicketModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
