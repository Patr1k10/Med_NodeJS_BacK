import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('FRONTEND_ORIGIN'),
    methods: configService.get('CRORS_METHODS'),
    credentials: true,
  });
  await app.listen(configService.get('API_PORT') || 3000);
}
bootstrap();
