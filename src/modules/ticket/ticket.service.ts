import { CreateTicketDto } from './dto/create-ticket.dto';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Bot } from 'grammy';
import { BOT_NAME } from 'src/constants';
import { BotContext } from 'src/types/interfaces';
import { Ticket, TicketStatus } from '../mikroorm/entities/Ticket';
import { RetrieveTicketDto } from './dto/retrieve-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { User } from '../mikroorm/entities/User';
import { TicketMessage } from '../mikroorm/entities/TicketMessage';

@Injectable()
export class TicketService {
  constructor(private readonly em: EntityManager, @Inject(forwardRef(() => BOT_NAME)) private bot: Bot<BotContext>) {}

  async findAll(where: FilterQuery<Ticket> = {}): Promise<RetrieveTicketDto[]> {
    const tickets = await this.em.find(Ticket, where, { populate: ['user', 'messages.user'], refresh: true });
    return tickets.map((ticket) => new RetrieveTicketDto(ticket));
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.em.findOne(Ticket, id, { populate: ['user', 'messages.user'] });
    if (!updateTicketDto.chatId && !updateTicketDto.userId) {
      updateTicketDto.chatId = 123456789;
    }
    const author = await this.em.findOneOrFail(User, {
      ...(updateTicketDto.chatId ? { chatId: updateTicketDto.chatId.toString() } : {}),
      ...(updateTicketDto.userId ? { id: +updateTicketDto.userId } : {}),
    });
    updateTicketDto.status ? (ticket.status = updateTicketDto.status as TicketStatus) : null;
    updateTicketDto.response ? ticket.messages.add(this.em.create(TicketMessage, { message: updateTicketDto.response, user: author })) : null;
    await this.em.persistAndFlush(ticket);
    if (updateTicketDto.status == TicketStatus.CLOSED) {
      const message = `Ваша заявка №${ticket.id} была обработана.\n\n${updateTicketDto.response}`;
      this.bot.api.sendMessage(ticket.user.chatId, message || '');
    }
    return new RetrieveTicketDto(ticket);
  }
  async create(createTicketDto: CreateTicketDto) {
    const user = await this.em.findOneOrFail(User, {
      ...(createTicketDto.chatId ? { chatId: createTicketDto.chatId } : {}),
      ...(createTicketDto.userId ? { username: createTicketDto.userId } : {}),
    });

    const ticket = this.em.create(Ticket, {
      object: createTicketDto.object,
      status: TicketStatus.PENDING,
      user: user,
    });
    await this.em.persistAndFlush(ticket);
    return new RetrieveTicketDto(ticket);
  }

  async findOne(id: number): Promise<RetrieveTicketDto> {
    const ticket = await this.em.findOneOrFail(Ticket, id, { populate: ['user', 'messages.user'] });
    return new RetrieveTicketDto(ticket);
  }
}
