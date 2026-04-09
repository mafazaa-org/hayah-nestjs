import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ListsModule } from '../lists/lists.module';
import { TaskEntity } from '../tasks/entities/task.entity';
import { ListEntity } from '../lists/entities/list.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { SearchHistoryEntity } from './entities/search-history.entity';
import { SavedSearchEntity } from './entities/saved-search.entity';
import { ListMemberEntity } from '../lists/entities/list-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      ListEntity,
      CommentEntity,
      SearchHistoryEntity,
      SavedSearchEntity,
      ListMemberEntity,
      WorkspaceEntity,
      UserEntity,
    ]),
    AuthModule,
    ListsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
