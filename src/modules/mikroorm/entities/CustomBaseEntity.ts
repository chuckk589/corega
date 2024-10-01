import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class CustomBaseEntity {
  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
