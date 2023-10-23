import { Module } from '@nestjs/common';
import {TypeOrmModule, TypeOrmModuleOptions, TypeOrmOptionsFactory} from '@nestjs/typeorm';

import {ConfigModule, ConfigService} from "@nestjs/config";




@Module({
  imports: [TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<{
    }> => ({
      type: 'postgres',
      host: configService.get('typeOrmConfig.host'),
      port: configService.get('typeOrmConfig.port'),
      username: configService.get('typeOrmConfig.username'),
      password: configService.get('typeOrmConfig.password'),
      database: configService.get('typeOrmConfig.database'),
      entities: configService.get('typeOrmConfig.entities'),
      synchronize: configService.get('typeOrmConfig.synchronize'),
    }),
  })],
})
export class DatabaseModule {}
