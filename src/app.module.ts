import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
