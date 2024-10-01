import { Notification, NotificationStatus } from '../../mikroorm/entities/Notification';

export class RetrieveNotificationDto {
  constructor(notification: Notification) {
    this.text = notification.text;
    this.createdAt = notification.createdAt.toLocaleString();
    this.executeAt = notification.executeAt.toLocaleString();
    this.expected = notification.expected;
    this.delivered = notification.delivered;
    switch (notification.status) {
      case NotificationStatus.pending:
        this.status = 'Ожидание';
        break;
      case NotificationStatus.cancelled:
        this.status = 'Отменена';
        break;
      case NotificationStatus.executed:
        this.status = 'Выполнена';
        break;
    }
    this.id = notification.id.toString();
  }
  id: string;
  text: string;
  createdAt: string;
  executeAt: string;
  status: string;
  expected: number;
  delivered: number;
}
