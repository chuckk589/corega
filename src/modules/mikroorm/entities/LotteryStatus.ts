import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';
import { User } from './User';

export enum LotteryState {
  PENDING = 'PENDING',
  ENDED = 'ENDED',
}

@Entity()
export class LotteryStatus {
  @PrimaryKey()
  id!: number;

  @Enum({ items: () => LotteryState, default: LotteryState.PENDING })
  name: LotteryState;

  @ManyToOne(() => Translation)
  translation: Translation;
}
