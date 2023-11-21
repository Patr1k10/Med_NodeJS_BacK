import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { Notification } from './entity/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Notification])],
  providers: [NotificationsService],
})
export class NotificationsModule {}
