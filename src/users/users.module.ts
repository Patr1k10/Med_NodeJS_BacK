import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {User} from "../entities/user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PaginationService} from "../common/pagination.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, PaginationService]
})
export class UsersModule {}
