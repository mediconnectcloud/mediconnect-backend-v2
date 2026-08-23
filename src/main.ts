import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173';
  app.enableCors({ origin: corsOrigin.split(',').map((o) => o.trim()) });

  // Rejects any request body field that isn't declared on its DTO, and
  // returns a 400 with a clear message instead of silently accepting bad input.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MediConnect backend running on http://localhost:${port}`);
}
bootstrap();
