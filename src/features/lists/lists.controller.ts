import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { DuplicateListDto } from './dto/duplicate-list.dto';
import { CreateListTemplateDto } from './dto/create-list-template.dto';
import { CreateListFromTemplateDto } from './dto/create-list-from-template.dto';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body() createListDto: CreateListDto): Promise<ListEntity> {
    return this.listsService.create(createListDto);
  }

  @Get()
  findAll(
    @Query('workspaceId') workspaceId?: string,
    @Query('folderId') folderId?: string,
  ): Promise<ListEntity[]> {
    return this.listsService.findAll(workspaceId, folderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ListEntity> {
    return this.listsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
  ): Promise<ListEntity> {
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.listsService.remove(id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string): Promise<ListEntity> {
    return this.listsService.archive(id);
  }

  @Post(':id/unarchive')
  unarchive(@Param('id') id: string): Promise<ListEntity> {
    return this.listsService.unarchive(id);
  }

  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @Body() duplicateListDto: DuplicateListDto,
  ): Promise<ListEntity> {
    return this.listsService.duplicate(id, duplicateListDto);
  }

  @Post('templates')
  createTemplate(
    @CurrentUser() user: { userId: string },
    @Body() createTemplateDto: CreateListTemplateDto,
  ): Promise<ListTemplateEntity> {
    return this.listsService.createTemplate(user.userId, createTemplateDto);
  }

  @Get('templates')
  findAllTemplates(
    @CurrentUser() user: { userId: string },
    @Query('workspaceId') workspaceId?: string,
    @Query('includePublic') includePublic?: string,
  ): Promise<ListTemplateEntity[]> {
    const includePublicFlag =
      includePublic === 'true' || includePublic === undefined;
    return this.listsService.findAllTemplates(
      user.userId,
      workspaceId,
      includePublicFlag,
    );
  }

  @Get('templates/:id')
  findTemplate(@Param('id') id: string): Promise<ListTemplateEntity> {
    return this.listsService.findTemplate(id);
  }

  @Post('templates/:id/create-list')
  createFromTemplate(
    @Param('id') templateId: string,
    @Body() createFromTemplateDto: CreateListFromTemplateDto,
  ): Promise<ListEntity> {
    return this.listsService.createFromTemplate(
      templateId,
      createFromTemplateDto,
    );
  }
}