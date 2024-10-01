import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Notification, NotificationStatus } from '../../mikroorm/entities/Notification';

export class UpdateNotificationDto {
  @IsNotEmpty()
  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}
