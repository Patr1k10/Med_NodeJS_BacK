import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import config from './typeorm.config';

dotenv.config();

@Module({
  imports: [TypeOrmModule.forRoot(config)],
})
export class DatabaseModule {}
