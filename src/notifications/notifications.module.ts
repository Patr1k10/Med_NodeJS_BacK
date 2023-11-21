import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/entity/company.entity';
import { Notification } from './entity/notification.entity';
import { NotificationsController } from './notifications.controller';
import { User } from '../users/entities/user.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { CronNotificationService } from './cron.notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Notification, User, Quiz, QuizResult])],
  providers: [NotificationsService, CronNotificationService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
