import { BeforeCreate, Collection, Entity, Enum, EventArgs, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CustomBaseEntity } from './CustomBaseEntity';
import { User } from './User';
import { TicketMessage } from './TicketMessage';

export enum TicketStatus {
  PENDING = 'pending',
  ANSWERED = 'answered',
  CLOSED = 'closed',
}

@Entity()
export class Ticket extends CustomBaseEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 512 })
  object!: string;

  @ManyToOne(() => User)
  user!: User;

  @Enum({ items: () => TicketStatus, default: TicketStatus.PENDING })
  status: TicketStatus;

  @OneToMany(() => TicketMessage, (message) => message.ticket, { orphanRemoval: true })
  messages = new Collection<TicketMessage>(this);
}
