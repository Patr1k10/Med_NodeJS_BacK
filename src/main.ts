import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);



  // Пример использования конкретных переменных
  console.log('API_PORT:', configService.get('API_PORT'));
  console.log('API_HOST:', configService.get('API_HOST'));
  console.log('FRONTEND_ORIGIN:', configService.get('FRONTEND_ORIGIN'));
  console.log('CRORS_METHODS:', configService.get('CRORS_METHODS'));
  console.log('PG_HOST:', configService.get('PG_HOST'));
  console.log('PG_PORT:', configService.get('PG_PORT'));
  console.log('PG_USER:', configService.get('PG_USER'));
  console.log('PG_PASSWORD:', configService.get('PG_PASSWORD'));
  console.log('PG_DB:', configService.get('PG_DB'));
  console.log('REDIS_PORT:', configService.get('REDIS_PORT'));
  console.log('REDIS_HOST:', configService.get('REDIS_HOST'));
  console.log('REDIS_URL:', configService.get('REDIS_URL'));
  console.log('REDIS_TTL:', configService.get('REDIS_TTL'));
  console.log('REDIS_PASS:', configService.get('REDIS_PASS'));
  console.log('AUTH0_AUDIENCE:', configService.get('AUTH0_AUDIENCE'));
  console.log('AUTH0_URL:', configService.get('AUTH0_URL'));
  console.log('AUTH0_TOKENSIGNIN:', configService.get('AUTH0_TOKENSIGNIN'));
  console.log('AUTH0_CLIENT_ID:', configService.get('AUTH0_CLIENT_ID'));
  console.log('AUTH0_DOMAIN:', configService.get('AUTH0_DOMAIN'));
  console.log('AUTHO_CALLBACK:', configService.get('AUTHO_CALLBACK'));
  console.log('AUTH0_SECRET:', configService.get('AUTH0_SECRET'));
  console.log('SECRET_ACCESS:', configService.get('SECRET_ACCESS'));
  console.log('SECRET_REFRESH:', configService.get('SECRET_REFRESH'));
  console.log('SECRET_ACTION:', configService.get('SECRET_ACTION'));
  console.log('CLIENT_ORIGIN_URL:', configService.get('CLIENT_ORIGIN_URL'));

  app.enableCors({
    origin: configService.get('FRONTEND_ORIGIN'),
    methods: configService.get('CRORS_METHODS'),
    credentials: true,
  });
  await app.listen(configService.get('API_PORT') || 3000);
}
bootstrap();
