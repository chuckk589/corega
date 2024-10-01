import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class Config {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  name?: string;

  @Property({ length: 512, nullable: true })
  value?: string;

  @Property({ length: 255, nullable: true })
  category?: string;

  @Property({ length: 255, nullable: true })
  description?: string;
}
