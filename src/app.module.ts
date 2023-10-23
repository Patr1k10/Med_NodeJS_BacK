import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import {DatabaseModule} from "./db/database.module";


@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
