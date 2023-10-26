import {Logger, Module} from '@nestjs/common';
import { HealthController } from './health.controller';
import {DatabaseModule} from "./db/database.module";
import {ConfigModule, } from "@nestjs/config";
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [HealthController,],
  providers: [Logger],
})
export class AppModule {}
