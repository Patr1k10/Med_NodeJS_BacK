import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';
import { Invitation } from '../invitation/entity/invitation.entity';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from './entities/quiz.entity';
import { QuizResult } from './entities/quiz.result.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '../notifications/entity/notification.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Auth } from '../auth/entities/auth.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Invitation, Quiz, QuizResult, Notification]), NotificationsModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
