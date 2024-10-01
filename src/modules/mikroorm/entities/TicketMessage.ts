import { BeforeCreate, Collection, Entity, Enum, EventArgs, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';
import { Ticket } from './Ticket';

export enum TicketStatus {
  PENDING = 'pending',
  ANSWERED = 'answered',
  CLOSED = 'closed',
}

@Entity()
export class TicketMessage extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 512 })
  message!: string;

  @ManyToOne(() => Ticket)
  ticket!: Ticket;

  @ManyToOne(() => User)
  user!: User;
}
