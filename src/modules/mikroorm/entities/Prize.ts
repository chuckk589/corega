import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';

@Entity()
export class Prize {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name: string;

  @ManyToOne(() => Translation)
  translation: Translation;
}
