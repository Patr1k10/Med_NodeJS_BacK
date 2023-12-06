import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { ExportService } from './export.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisTtl = configService.get<number>('REDIS_TTL');

        // Выводим значения переменных окружения в консоль
        console.log('REDIS_URL:', redisUrl);
        console.log('REDIS_TTL:', redisTtl);

        return {
          store: await redisStore({
            url: redisUrl,
            ttl: redisTtl,
          }),
        };
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  providers: [ExportService],
  exports: [ExportService],
})
export class RedisModule {}
