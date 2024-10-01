import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from '../mikroorm/entities/Notification';
import fs from 'fs';
import { RetrieveNotificationDto } from './dto/retrieve-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
// import { NotificationQueueService } from './notification-queue.service';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { NOTIF_TG, NOTIF_TG_CHILD, NOTIF_TG_PRODUCER } from 'src/constants';
import { NOTIFICATION_STATE, NotificationFlowService } from './services/notification-flow.service';

@Injectable()
export class NotificationService {
  constructor(private readonly em: EntityManager, private readonly notificationFlowService: NotificationFlowService) {}
  async getTemplates() {
    const ru = JSON.parse(fs.readFileSync('./dist/modules/bot/locales/ru.json', 'utf8'));
    const targetKeys = Object.keys(ru).filter((key) => key.startsWith('WEEKLY_NOTIFY'));
    return targetKeys.map((key, index) => {
      return {
        value: key,
        content: `${ru[key]} `,
        title: `Еженедельное уведомление ${index + 1}`,
      };
    });
  }

  async update(updateNotificationDto: UpdateNotificationDto, id: number): Promise<void> {
    await this.em.nativeUpdate(Notification, { id }, updateNotificationDto);
  }
  async test(createNotificationDto: CreateNotificationDto, files: { images?: Express.Multer.File[] }) {
    const notification = this.em.create(Notification, {});
    createNotificationDto.templateKey ? (notification.templateKey = createNotificationDto.templateKey) : (notification.text = createNotificationDto.text);
    notification.imagePaths = JSON.stringify(this.writeFiles(files));
    notification.buttons = createNotificationDto.buttons || '[]';
    this.notificationFlowService.createParentFlow(notification, NOTIFICATION_STATE.TEST);
  }
  private writeFiles(files: { images?: Express.Multer.File[] }): string[] {
    if (!files.images) return [];
    const uploaddir = `./dist/public/${Date.now()}`;
    if (!fs.existsSync(uploaddir)) {
      fs.mkdirSync(uploaddir, { recursive: true });
    }
    return files.images.map((file, index) => {
      const filepath = `${uploaddir}/${index}.${file.originalname.split('.').pop()}`;
      fs.writeFileSync(filepath, file.buffer);
      return filepath.split('public/').pop();
    });
  }
  async create(createNotificationDto: CreateNotificationDto, files: { images?: Express.Multer.File[] }): Promise<void> {
    const notification = this.em.create(Notification, {});
    createNotificationDto.templateKey ? (notification.templateKey = createNotificationDto.templateKey) : (notification.text = createNotificationDto.text);

    notification.checkOwnersOnly = createNotificationDto.checkOwnersOnly === 'true';
    notification.registeredOnly = createNotificationDto.registeredOnly === 'true';
    notification.imagePaths = JSON.stringify(this.writeFiles(files));
    notification.buttons = createNotificationDto.buttons || '[]';
    createNotificationDto.start && (notification.executeAt = new Date(createNotificationDto.start));

    await this.em.persistAndFlush(notification);
    this.notificationFlowService.createParentFlow(notification, NOTIFICATION_STATE.DEFAULT);
  }

  async findAll(): Promise<RetrieveNotificationDto[]> {
    const notifications = await this.em.find(Notification, {}, { populate: [] });
    return notifications.map((notification) => new RetrieveNotificationDto(notification));
  }
}
