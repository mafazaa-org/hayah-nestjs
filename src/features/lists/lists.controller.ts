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
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';
import { UpdateFilterPresetDto } from './dto/update-filter-preset.dto';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { FilterPresetEntity } from './entities/filter-preset.entity';

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

  // Custom Field endpoints - must come before templates/:id route
  @Post('custom-fields')
  createCustomField(
    @Body() createCustomFieldDto: CreateCustomFieldDto,
  ): Promise<CustomFieldEntity> {
    return this.listsService.createCustomField(createCustomFieldDto);
  }

  @Get('custom-fields')
  findAllCustomFields(@Query('listId') listId: string): Promise<CustomFieldEntity[]> {
    return this.listsService.findAllCustomFields(listId);
  }

  @Get('custom-fields/:id')
  findOneCustomField(@Param('id') id: string): Promise<CustomFieldEntity> {
    return this.listsService.findOneCustomField(id);
  }

  @Put('custom-fields/:id')
  updateCustomField(
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomFieldEntity> {
    return this.listsService.updateCustomField(id, updateCustomFieldDto);
  }

  @Delete('custom-fields/:id')
  removeCustomField(@Param('id') id: string): Promise<void> {
    return this.listsService.removeCustomField(id);
  }

  // Filter Preset endpoints - must come before templates/:id route
  @Post('filter-presets')
  createFilterPreset(
    @CurrentUser() user: { userId: string },
    @Body() createFilterPresetDto: CreateFilterPresetDto,
  ): Promise<FilterPresetEntity> {
    return this.listsService.createFilterPreset(user.userId, createFilterPresetDto);
  }

  @Get('filter-presets')
  findAllFilterPresets(
    @CurrentUser() user: { userId: string },
    @Query('listId') listId?: string,
  ): Promise<FilterPresetEntity[]> {
    return this.listsService.findAllFilterPresets(user.userId, listId);
  }

  @Get('filter-presets/:id')
  findOneFilterPreset(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<FilterPresetEntity> {
    return this.listsService.findOneFilterPreset(id, user.userId);
  }

  @Put('filter-presets/:id')
  updateFilterPreset(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateFilterPresetDto: UpdateFilterPresetDto,
  ): Promise<FilterPresetEntity> {
    return this.listsService.updateFilterPreset(id, user.userId, updateFilterPresetDto);
  }

  @Delete('filter-presets/:id')
  removeFilterPreset(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.listsService.removeFilterPreset(id, user.userId);
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