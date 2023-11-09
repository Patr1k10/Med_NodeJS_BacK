import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from './entity/company.entity';
import { AuthModule } from '../auth/auth.module';
import { Invitation } from '../invitation/entity/invitation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company, Invitation]), AuthModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
