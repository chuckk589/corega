import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
// import { NotificationQueueService } from './notification-queue.service';
import { BullModule } from '@nestjs/bullmq';
import { NOTIF_TG_CHILD, NOTIF_TG, NOTIF_TG_PRODUCER } from 'src/constants';
import { NotificationConsumer } from './processors/notification.processor';
import { NotificationConsumerChild } from './processors/notification_child.processor';
import { NotificationFlowService } from './services/notification-flow.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: NOTIF_TG_CHILD,
      },
      {
        name: NOTIF_TG,
      },
    ),
    BullModule.registerFlowProducer({
      name: NOTIF_TG_PRODUCER,
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer, NotificationConsumerChild, NotificationFlowService],
})
export class NotificationModule {}
