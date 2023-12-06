import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { ExportService } from './export.service';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisTtl = configService.get<number>('REDIS_TTL');

        console.log('REDIS_HOST:', redisHost);
        console.log('REDIS_PORT:', redisPort);
        console.log('REDIS_TTL:', redisTtl);

        return {
          store: redisStore,
          host: redisHost,
          port: redisPort,
          ttl: redisTtl,
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
