import {Logger, Module} from '@nestjs/common';

import { HealthController } from './health.controller';
import {DatabaseModule} from "./db/database.module";
import {ConfigModule, } from "@nestjs/config";




@Module({
  imports: [DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
