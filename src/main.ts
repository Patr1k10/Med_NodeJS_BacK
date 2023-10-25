import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import {ConfigService} from "@nestjs/config";
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get the port number from the configuration
  const PORT = configService.get<number>('port');
  app.enableCors({
    origin: configService.get('crosConfig.origin'),
    methods:configService.get('crosConfig.methods'),
    credentials: true,
  });
  await app.listen(PORT);
}
bootstrap();
