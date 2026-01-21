import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ListEntity } from '../lists/entities/list.entity';
import { StatusEntity } from '../statuses/entities/status.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { AssignmentEntity } from './entities/assignment.entity';
import { TaskEntity } from './entities/task.entity';
import { TaskPriorityEntity } from './entities/task-priority.entity';
import { TaskTagEntity } from './entities/task-tag.entity';
import { ChecklistEntity } from './entities/checklist.entity';
import { ChecklistItemEntity } from './entities/checklist-item.entity';
import { TaskDependencyEntity } from './entities/task-dependency.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SubtaskEntity } from './entities/subtask.entity';
import { TaskCustomFieldValueEntity } from './entities/task-custom-field-value.entity';
import { CustomFieldEntity } from '../lists/entities/custom-field.entity';
import { ActivityEntity } from './entities/activity.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivitiesService } from './services/activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      ListEntity,
      StatusEntity,
      TaskPriorityEntity,
      AssignmentEntity,
      TaskTagEntity,
      TagEntity,
      SubtaskEntity,
      ChecklistEntity,
      ChecklistItemEntity,
      TaskDependencyEntity,
      TaskCustomFieldValueEntity,
      CustomFieldEntity,
      ActivityEntity,
      UserEntity,
    ]),
    AuthModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, ActivitiesService],
  exports: [TasksService, ActivitiesService],
})
export class TasksModule {}
