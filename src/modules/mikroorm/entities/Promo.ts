import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';

@Entity()
export class Promo {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name: string;

  @ManyToOne(() => Translation)
  translation: Translation;
}
