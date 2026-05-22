import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOrigins = configService.get<string>('CORS_ORIGINS', '');
  const isDev =
    configService.get<string>('NODE_ENV') !== 'production';

  app.enableCors({
    origin: isDev
      ? true
      : allowedOrigins
        ? allowedOrigins.split(',').map((s) => s.trim())
        : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'Accept-Language',
    ],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const i18n = app.get(I18nService);
  app.useGlobalFilters(new HttpExceptionFilter(i18n));

  const config = new DocumentBuilder()
    .setTitle('Money Tracker API')
    .setDescription(
      'API for Escape from Consumer Society financial tracker',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`API docs: http://localhost:${port}/docs`);
}

bootstrap();
