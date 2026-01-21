import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StatusEntity } from '../statuses/entities/status.entity';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListEntity,
      StatusEntity,
      ListTemplateEntity,
      CustomFieldEntity,
    ]),
    AuthModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
