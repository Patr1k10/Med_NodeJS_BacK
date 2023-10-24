import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

config();  // Loading environment variables from .env file.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  // Creating a NestJS application instance.

  // Enabling Cross-Origin Resource Sharing (CORS) for the app.
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',  // Allowing requests from specified origin or defaulting to localhost:3000.
    methods: process.env.CRORS_METHODS,  // Specifying allowed HTTP methods.
    credentials: true,  // Allowing credentials (e.g., cookies) to be included in CORS requests.
  });

  await app.listen(process.env.PORT || 3000);  // Starting the application, listening on the specified port or defaulting to 3000.
}

bootstrap();  // Calling the bootstrap function to start the NestJS application.
