import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Prize } from './Prize';

@Entity()
export class PrizeValue {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name: string;

  @Property({ length: 255, nullable: true })
  value: string;
}
