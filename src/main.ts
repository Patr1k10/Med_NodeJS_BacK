import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    methods: process.env.CRORS_METHODS,
    credentials: true,
  });
  await app.listen( process.env.PORT || 3000);
}
bootstrap();
