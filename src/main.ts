import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Hayah API')
    .setDescription(
      'REST API for Hayah (task management). Auth via JWT; use **Authorize** for protected routes. ' +
        'Versioned under `/api/v1`.',
    )
    .setVersion('1')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('auth', 'Register, login, password reset, email verification')
    .addTag('users', 'Profile, settings')
    .addTag('folders', 'Folder hierarchy')
    .addTag('lists', 'Lists, views, filter presets, custom fields, members')
    .addTag('tasks', 'Tasks, statuses, dependencies, custom field values, filter, search, calendar')
    .addTag('comments', 'Task comments')
    .addTag('attachments', 'File uploads')
    .addTag('notifications', 'In-app notifications')
    .addTag('tags', 'Tags')
    .addTag('statuses', 'List statuses')
    .addTag('webhooks', 'Outgoing webhooks for task events (create, update, delete)')
    .addTag('export-import', 'Export lists/tasks (JSON, CSV), import tasks from CSV, bulk operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
