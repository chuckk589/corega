import { BeforeCreate, Cascade, Collection, Entity, EventArgs, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { LotteryState, LotteryStatus } from './LotteryStatus';
import { Prize } from './Prize';
import { Locale } from './User';
import { Winner } from './Winner';
import { DateTime } from 'luxon';

@Entity()
export class Lottery extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  start!: Date;

  @Property()
  end!: Date;

  @Property({ default: 0 })
  primaryWinners!: number;

  @Property({ default: 0 })
  reserveWinners!: number;

  @ManyToOne(() => LotteryStatus)
  status!: LotteryStatus;

  @ManyToOne(() => Prize)
  prize!: Prize;

  @OneToMany(() => Winner, (winner) => winner.lottery, { orphanRemoval: true })
  winners = new Collection<Winner>(this);

  @BeforeCreate()
  async beforeCreate(args: EventArgs<Lottery>): Promise<void> {
    if (!this.status) {
      this.status = await args.em.findOne(LotteryStatus, { name: LotteryState.PENDING });
    }
  }
}
export class BotLotteryDto {
  constructor(lottery: Lottery) {
    this.week = DateTime.fromJSDate(lottery.end).weekNumber;
    this.prize = lottery.prize.name;
    this.winners = lottery.winners.getItems().map((winner) => ({ prizeKey: winner.prizeValue.name, phone: winner.check.user.phone.slice(0, -6) + 'XXXX' + winner.check.user.phone.slice(-2) }));
    //to dd.mm.yyyy
    this.date = DateTime.fromJSDate(lottery.end).toFormat('dd.LL.yyyy');
  }
  week: number;
  prize: string;
  date: string;
  winners: { phone: string; prizeKey: string }[];
}
