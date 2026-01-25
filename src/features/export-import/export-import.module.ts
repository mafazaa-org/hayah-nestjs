import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ListsModule } from '../lists/lists.module';
import { TasksModule } from '../tasks/tasks.module';
import { StatusesModule } from '../statuses/statuses.module';
import { TaskPriorityEntity } from '../tasks/entities/task-priority.entity';
import { ExportImportController } from './export-import.controller';
import { ExportImportService } from './export-import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskPriorityEntity]),
    AuthModule,
    ListsModule,
    TasksModule,
    StatusesModule,
  ],
  controllers: [ExportImportController],
  providers: [ExportImportService],
})
export class ExportImportModule {}
