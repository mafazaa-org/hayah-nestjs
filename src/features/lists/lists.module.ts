import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TasksModule } from '../tasks/tasks.module';
import { StatusEntity } from '../statuses/entities/status.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { ListMemberEntity } from './entities/list-member.entity';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { FilterPresetEntity } from './entities/filter-preset.entity';
import { ViewEntity } from './entities/view.entity';
import { IterationEntity } from './entities/iteration.entity';
import { InviteLinkEntity } from './entities/invite-link.entity';
import { TaskIterationEntity } from '../tasks/entities/task-iteration.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { IterationsController } from './iterations.controller';
import { IterationsService } from './iterations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListEntity,
      StatusEntity,
      ListTemplateEntity,
      ListMemberEntity,
      UserEntity,
      CustomFieldEntity,
      FilterPresetEntity,
      ViewEntity,
      IterationEntity,
      TaskIterationEntity,
      TaskEntity,
      InviteLinkEntity,
    ]),
    AuthModule,
    TasksModule,
  ],
  controllers: [ListsController, IterationsController],
  providers: [ListsService, IterationsService],
  exports: [ListsService, IterationsService],
})
export class ListsModule {}
