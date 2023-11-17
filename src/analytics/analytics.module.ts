import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizResult, User, Company])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
