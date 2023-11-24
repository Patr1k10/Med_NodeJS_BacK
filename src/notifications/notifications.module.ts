import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { Notification } from './entity/notification.entity';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Company, Notification, User])],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
