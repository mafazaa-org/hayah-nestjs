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
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { ListEntity } from './entities/list.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { FilterPresetEntity } from './entities/filter-preset.entity';
import { ViewEntity } from './entities/view.entity';
import { ListMemberEntity } from './entities/list-member.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { InviteUserToListDto } from './dto/invite-user-to-list.dto';
import { UpdateListMemberRoleDto } from './dto/update-list-member-role.dto';
import { ListMemberResponseDto } from './dto/list-member-response.dto';
import { ListPermissionsResponseDto } from './dto/list-permissions-response.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('lists')
@ApiBearerAuth('access-token')
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

  // View endpoints (Multiple Board Views) - must come before :id route
  @Post('views')
  createView(
    @CurrentUser() user: { userId: string },
    @Body() createViewDto: CreateViewDto,
  ): Promise<ViewEntity> {
    return this.listsService.createView(user.userId, createViewDto);
  }

  @Get('views')
  findAllViews(
    @CurrentUser() user: { userId: string },
    @Query('listId') listId?: string,
  ): Promise<ViewEntity[]> {
    return this.listsService.findAllViews(user.userId, listId);
  }

  @Get('views/:id/tasks')
  getTasksForView(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<TaskEntity[]> {
    return this.listsService.getTasksForView(id, user.userId);
  }

  @Get('views/:id')
  findOneView(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<ViewEntity> {
    return this.listsService.findOneView(id, user.userId);
  }

  @Put('views/:id')
  updateView(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateViewDto: UpdateViewDto,
  ): Promise<ViewEntity> {
    return this.listsService.updateView(id, user.userId, updateViewDto);
  }

  @Delete('views/:id')
  removeView(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ): Promise<void> {
    return this.listsService.removeView(id, user.userId);
  }

  // List Member (Sharing/Teams) endpoints - must come before templates/:id route

  @Post(':id/members/invite')
  inviteUserToList(
    @Param('id') listId: string,
    @CurrentUser() user: { userId: string },
    @Body() inviteUserToListDto: InviteUserToListDto,
  ): Promise<ListMemberEntity> {
    return this.listsService.inviteUserToList(
      listId,
      user.userId,
      inviteUserToListDto,
    );
  }

  @Get(':id/members')
  findAllListMembers(
    @Param('id') listId: string,
  ): Promise<ListMemberResponseDto[]> {
    return this.listsService.findAllListMembers(listId);
  }

  @Get('members/:id')
  findOneListMember(@Param('id') id: string): Promise<ListMemberResponseDto> {
    return this.listsService.findOneListMember(id);
  }

  @Put('members/:id/role')
  updateListMemberRole(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() updateListMemberRoleDto: UpdateListMemberRoleDto,
  ): Promise<ListMemberEntity> {
    return this.listsService.updateListMemberRole(
      id,
      user.userId,
      updateListMemberRoleDto,
    );
  }

  @Delete('members/:id')
  removeListMember(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.listsService.removeListMember(id, user.userId);
  }

  @Get(':id/permissions')
  checkUserPermission(
    @Param('id') listId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ListPermissionsResponseDto> {
    return this.listsService.checkUserPermission(listId, user.userId);
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