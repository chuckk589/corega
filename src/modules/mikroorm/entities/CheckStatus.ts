import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';
import { User } from './User';

export enum CheckState {
  MODERATED = 'moderated',
  REJECTED = 'rejected',
  APPROVED = 'approved',
}

@Entity()
export class CheckStatus {
  @PrimaryKey()
  id!: number;

  @Enum({ items: () => CheckState, default: CheckState.MODERATED })
  name: CheckState;

  @ManyToOne(() => Translation, { nullable: true })
  comment: Translation;

  @ManyToOne(() => Translation)
  translation: Translation;
}
