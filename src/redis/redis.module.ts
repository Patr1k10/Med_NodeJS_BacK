import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { ExportService } from './export.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>('REDIS_URL'),
          ttl: configService.get<number>('REDIS_TTL'),
        }),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  providers: [ExportService],
  exports: [ExportService],
})
export class RedisModule {}