import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Translation } from './Translation';
import { Locale, User } from './User';

@Entity()
export class TranslationValue {
  @PrimaryKey()
  id!: number;

  @Property({ length: 255, nullable: true })
  value!: string;

  @Enum({ items: () => Locale })
  code!: Locale;

  @ManyToOne(() => Translation, { mapToPk: true })
  translation!: Translation;
}
