import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import {DatabaseModule} from "./db/database.module";
import {ConfigModule, } from "@nestjs/config";
import {configuration} from "./config";



@Module({
  imports: [DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
      load: [configuration], // Load the environment variables from the configuration file
    }),
  //   RedisModule.forRootAsync({
  //   useFactory: (configService: ConfigService) => createRedisOptions(configService),
  //   inject: [ConfigService],
  // }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
