import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';
import { Invitation } from '../invitation/entity/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Invitation])],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
