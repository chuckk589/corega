import { Entity, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';
import { User } from './User';

@Entity()
export class City {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name: string;

  @ManyToOne(() => Translation)
  translation: Translation;
}
