import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { InlineKeyboardMarkup } from 'grammy/out/types.node';
import { User } from './User';
export enum NotificationStatus {
  pending = 'pending',
  executed = 'executed',
  cancelled = 'cancelled',
}

@Entity()
export class Notification {
  @PrimaryKey()
  id!: number;

  @Property({ fieldName: 'createdAt' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updatedAt', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  executeAt: Date = new Date();

  @Enum({ items: () => NotificationStatus, default: NotificationStatus.pending })
  status?: NotificationStatus;

  @Property({ length: 255, nullable: true })
  text?: string;

  @Property({ length: 512, nullable: true })
  buttons?: string;

  @Property({ nullable: true, default: 0 })
  expected?: number;

  @Property({ nullable: true, default: 0 })
  delivered?: number;

  @Property({ length: 512, nullable: true })
  imagePaths?: string;

  @Property({ nullable: true })
  templateKey: string;

  @Property({ nullable: true, default: false })
  registeredOnly?: boolean;

  @Property({ nullable: true, default: false })
  checkOwnersOnly?: boolean;

  getImagePaths(): string[] {
    const parsed = JSON.parse(this.imagePaths || '[]');
    return parsed.length ? parsed : [];
  }
  getButtons(): InlineKeyboardMarkup {
    const parsed = JSON.parse(this.buttons || '[]');
    const buttons = parsed.reduce(
      (acc: any, button: parsedButton) => {
        acc.inline_keyboard[button.row] = acc.inline_keyboard[button.row] || [];
        acc.inline_keyboard[button.row].push({ url: button.url, text: button.text });
        return acc;
      },
      { inline_keyboard: [] },
    );
    buttons.inline_keyboard = buttons.inline_keyboard.filter((row: any) => row.length);
    return buttons;
  }
}

type parsedButton = {
  url: string;
  text: string;
  row: number;
};
