import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerDocsSkipGuard } from './common/guards/throttler-docs-skip.guard';
import { AttachmentsModule } from './features/attachments/attachments.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { FoldersModule } from './features/folders/folders.module';
import { ListsModule } from './features/lists/lists.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { StatusesModule } from './features/statuses/statuses.module';
import { TasksModule } from './features/tasks/tasks.module';
import { TagsModule } from './features/tags/tags.module';
import { UsersModule } from './features/users/users.module';
import { EmailModule } from './common/email/email.module';
import { EventsModule } from './features/events/events.module';
import { WebhooksModule } from './features/webhooks/webhooks.module';
import { ExportImportModule } from './features/export-import/export-import.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database') as ReturnType<typeof databaseConfig>,
      inject: [ConfigService],
    }),
    EmailModule,
    AttachmentsModule,
    AuthModule,
    CommentsModule,
    FoldersModule,
    ListsModule,
    NotificationsModule,
    StatusesModule,
    TasksModule,
    UsersModule,
    TagsModule,
    EventsModule,
    WebhooksModule,
    ExportImportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerDocsSkipGuard },
  ],
})
export class AppModule {}
