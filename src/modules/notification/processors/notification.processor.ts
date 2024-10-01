import { InjectFlowProducer, InjectQueue, OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { FlowProducer, Job } from 'bullmq';
import { Bot } from 'grammy';
import { BOT_NAME, NOTIF_TG, NOTIF_TG_CHILD, NOTIF_TG_PRODUCER } from 'src/constants';
import { BotContext } from 'src/types/interfaces';
import { Notification, NotificationStatus } from '../../mikroorm/entities/Notification';
import { EntityManager } from '@mikro-orm/mysql';
import { NOTIFICATION_STATE, NotificationFlowData } from '../services/notification-flow.service';
@Processor(NOTIF_TG)
export class NotificationConsumer extends WorkerHost {
  constructor(private readonly em: EntityManager) {
    super();
  }
  async process(job: Job<NotificationFlowData, void, string>): Promise<any> {
    const results = Object.values(await job.getChildrenValues());
    if (job.data.notificationId) {
      const notification = await this.em.findOne(Notification, { id: job.data.notificationId });
      if (notification) {
        notification.status = NotificationStatus.executed;
        notification.delivered = results.filter((r) => r === true).length;
        notification.expected = results.length;
        await this.em.persistAndFlush(notification);
      }
    }
    console.log(`NOTIF_TG process`, results, job.data.notificationId);
    return {};
  }
}
