import { Logger, Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransformResponseInterceptor } from './interceptor/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { CompanyModule } from './company/company.module';
import { InvitationModule } from './invitation/invitation.module';
import { QuizModule } from './quizzes/quiz.module';

@Module({
  imports: [
    DatabaseModule,
    CompanyModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true, // Make the configuration global
    }),
    UsersModule,
    AuthModule,
    InvitationModule,
    QuizModule,
  ],
  controllers: [HealthController],
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
