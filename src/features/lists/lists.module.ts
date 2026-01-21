import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StatusEntity } from '../statuses/entities/status.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { ListMemberEntity } from './entities/list-member.entity';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { FilterPresetEntity } from './entities/filter-preset.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

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
    ]),
    AuthModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
