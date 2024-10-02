import { Ticket, TicketStatus } from 'src/modules/mikroorm/entities/Ticket';

export class RetrieveTicketDto {
  constructor(ticket: Ticket) {
    this.id = ticket.id.toString();
    this.chatId = ticket.user.chatId;
    this.username = ticket.user.username;
    this.createdAt = ticket.createdAt;
    this.object = ticket.object;
    this.history = ticket.messages?.getItems()?.map((message) => ({ message: message.message, createdAt: message.createdAt, user: message.user.username || message.user.chatId }));
    this.status = ticket.status;
  }
  id: string;
  chatId: string;
  username: string;
  object: string;
  history: { message: string; createdAt: Date; user: string }[];
  status: 'pending' | 'closed';
  createdAt: Date;
}
