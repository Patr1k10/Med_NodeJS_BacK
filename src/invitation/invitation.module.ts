import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../company/entity/company.entity';
import { Invitation } from './entity/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Invitation])],
  providers: [InvitationService],
  controllers: [InvitationController],
})
export class InvitationModule {}
