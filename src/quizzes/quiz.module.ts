import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';
import { Invitation } from '../invitation/entity/invitation.entity';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from './entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Invitation, Quiz])],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
