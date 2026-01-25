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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { AddTagToTaskDto } from './dto/add-tag-to-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { MoveSubtaskDto } from './dto/move-subtask.dto';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ReorderChecklistItemsDto } from './dto/reorder-checklist-items.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { SearchTasksDto } from './dto/search-tasks.dto';
import { SortField, SortDirection } from './dto/sort-tasks.dto';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { CreateTaskCustomFieldValueDto } from './dto/create-task-custom-field-value.dto';
import { UpdateTaskCustomFieldValueDto } from './dto/update-task-custom-field-value.dto';
import { TaskEntity } from './entities/task.entity';
import { AssignmentEntity } from './entities/assignment.entity';
import { TaskTagEntity } from './entities/task-tag.entity';
import { SubtaskEntity } from './entities/subtask.entity';
import { ChecklistEntity } from './entities/checklist.entity';
import { ChecklistItemEntity } from './entities/checklist-item.entity';
import { TaskDependencyEntity } from './entities/task-dependency.entity';
import { TaskCustomFieldValueEntity } from './entities/task-custom-field-value.entity';
import { ActivitiesService } from './services/activities.service';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.create(createTaskDto, user.userId);
  }

  @Get()
  findAll(
    @Query('listId') listId?: string,
    @Query('statusId') statusId?: string,
    @Query('includeArchived') includeArchived?: string,
    @Query('sortField') sortField?: SortField,
    @Query('sortDirection') sortDirection?: SortDirection,
    @Query('customFieldId') customFieldId?: string,
  ): Promise<TaskEntity[]> {
    const includeArchivedFlag = includeArchived === 'true';
    return this.tasksService.findAll(
      listId,
      statusId,
      includeArchivedFlag,
      sortField,
      sortDirection || SortDirection.ASC,
      customFieldId,
    );
  }

  @Post('filter')
  filterTasks(
    @Body() filterTasksDto: FilterTasksDto,
    @Query('sortField') sortField?: SortField,
    @Query('sortDirection') sortDirection?: SortDirection,
    @Query('customFieldId') customFieldId?: string,
  ): Promise<TaskEntity[]> {
    return this.tasksService.filterTasks(
      filterTasksDto,
      sortField,
      sortDirection || SortDirection.ASC,
      customFieldId,
    );
  }

  @Post('search')
  searchTasks(
    @Body() searchTasksDto: SearchTasksDto,
    @Query('sortField') sortField?: SortField,
    @Query('sortDirection') sortDirection?: SortDirection,
    @Query('customFieldId') customFieldId?: string,
  ): Promise<TaskEntity[]> {
    return this.tasksService.searchTasks(
      searchTasksDto,
      sortField,
      sortDirection || SortDirection.ASC,
      customFieldId,
    );
  }

  @Post('due-reminders/process')
  processDueReminders(): Promise<{ processed: number }> {
    return this.tasksService.processDueReminders();
  }

  @Get('calendar')
  getTasksForCalendar(
    @Query('listId') listId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<TaskEntity[]> {
    return this.tasksService.getTasksForCalendar(listId, start, end);
  }

  // Task Dependency endpoints - must come before :id route to avoid conflicts
  @Post('dependencies')
  createTaskDependency(
    @Body() createTaskDependencyDto: CreateTaskDependencyDto,
  ): Promise<TaskDependencyEntity> {
    return this.tasksService.createTaskDependency(createTaskDependencyDto);
  }

  @Get(':taskId/dependencies')
  findAllTaskDependencies(
    @Param('taskId') taskId: string,
  ): Promise<{ blocking: TaskDependencyEntity[]; blockedBy: TaskDependencyEntity[] }> {
    return this.tasksService.findAllTaskDependencies(taskId);
  }

  @Get('dependencies/:id')
  findOneTaskDependency(@Param('id') id: string): Promise<TaskDependencyEntity> {
    return this.tasksService.findOneTaskDependency(id);
  }

  @Delete('dependencies/:id')
  removeTaskDependency(@Param('id') id: string): Promise<void> {
    return this.tasksService.removeTaskDependency(id);
  }

  // Task Custom Field Value endpoints - must come before :id route to avoid conflicts
  @Post('custom-field-values')
  createTaskCustomFieldValue(
    @Body() createTaskCustomFieldValueDto: CreateTaskCustomFieldValueDto,
  ): Promise<TaskCustomFieldValueEntity> {
    return this.tasksService.createTaskCustomFieldValue(createTaskCustomFieldValueDto);
  }

  @Get(':taskId/custom-field-values')
  findAllTaskCustomFieldValues(
    @Param('taskId') taskId: string,
  ): Promise<TaskCustomFieldValueEntity[]> {
    return this.tasksService.findAllTaskCustomFieldValues(taskId);
  }

  @Get('custom-field-values/:id')
  findOneTaskCustomFieldValue(@Param('id') id: string): Promise<TaskCustomFieldValueEntity> {
    return this.tasksService.findOneTaskCustomFieldValue(id);
  }

  @Put('custom-field-values/:id')
  updateTaskCustomFieldValue(
    @Param('id') id: string,
    @Body() updateTaskCustomFieldValueDto: UpdateTaskCustomFieldValueDto,
  ): Promise<TaskCustomFieldValueEntity> {
    return this.tasksService.updateTaskCustomFieldValue(id, updateTaskCustomFieldValueDto);
  }

  @Delete('custom-field-values/:id')
  removeTaskCustomFieldValue(@Param('id') id: string): Promise<void> {
    return this.tasksService.removeTaskCustomFieldValue(id);
  }

  // Subtask endpoints - must come before :id route to avoid conflicts
  @Post('subtasks')
  createSubtask(@Body() createSubtaskDto: CreateSubtaskDto): Promise<SubtaskEntity> {
    return this.tasksService.createSubtask(createSubtaskDto);
  }

  @Get(':taskId/subtasks')
  findAllSubtasks(@Param('taskId') taskId: string): Promise<SubtaskEntity[]> {
    return this.tasksService.findAllSubtasks(taskId);
  }

  @Get('subtasks/:id')
  findOneSubtask(@Param('id') id: string): Promise<SubtaskEntity> {
    return this.tasksService.findOneSubtask(id);
  }

  @Put('subtasks/:id')
  updateSubtask(
    @Param('id') id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<SubtaskEntity> {
    return this.tasksService.updateSubtask(id, updateSubtaskDto);
  }

  @Delete('subtasks/:id')
  removeSubtask(@Param('id') id: string): Promise<void> {
    return this.tasksService.removeSubtask(id);
  }

  @Put('subtasks/:id/move')
  moveSubtask(
    @Param('id') id: string,
    @Body() moveSubtaskDto: MoveSubtaskDto,
  ): Promise<SubtaskEntity> {
    return this.tasksService.moveSubtask(id, moveSubtaskDto);
  }

  // Checklist endpoints - must come before :id route to avoid conflicts
  @Post('checklists')
  createChecklist(@Body() createChecklistDto: CreateChecklistDto): Promise<ChecklistEntity> {
    return this.tasksService.createChecklist(createChecklistDto);
  }

  @Post('checklist-items')
  createChecklistItem(@Body() createChecklistItemDto: CreateChecklistItemDto): Promise<ChecklistItemEntity> {
    return this.tasksService.createChecklistItem(createChecklistItemDto);
  }

  @Get(':taskId/checklists')
  findAllChecklists(@Param('taskId') taskId: string): Promise<ChecklistEntity[]> {
    return this.tasksService.findAllChecklists(taskId);
  }

  @Get(':checklistId/checklist-items')
  findAllChecklistItems(@Param('checklistId') checklistId: string): Promise<ChecklistItemEntity[]> {
    return this.tasksService.findAllChecklistItems(checklistId);
  }

  @Get('checklists/:id')
  findOneChecklist(@Param('id') id: string): Promise<ChecklistEntity> {
    return this.tasksService.findOneChecklist(id);
  }

  @Get('checklist-items/:id')
  findOneChecklistItem(@Param('id') id: string): Promise<ChecklistItemEntity> {
    return this.tasksService.findOneChecklistItem(id);
  }

  @Put('checklists/:id')
  updateChecklist(
    @Param('id') id: string,
    @Body() updateChecklistDto: UpdateChecklistDto,
  ): Promise<ChecklistEntity> {
    return this.tasksService.updateChecklist(id, updateChecklistDto);
  }

  @Delete('checklists/:id')
  removeChecklist(@Param('id') id: string): Promise<void> {
    return this.tasksService.removeChecklist(id);
  }

  @Put('checklist-items/:id')
  updateChecklistItem(
    @Param('id') id: string,
    @Body() updateChecklistItemDto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemEntity> {
    return this.tasksService.updateChecklistItem(id, updateChecklistItemDto);
  }

  @Delete('checklist-items/:id')
  removeChecklistItem(@Param('id') id: string): Promise<void> {
    return this.tasksService.removeChecklistItem(id);
  }

  @Put('checklists/:checklistId/reorder-items')
  reorderChecklistItems(
    @Param('checklistId') checklistId: string,
    @Body() reorderChecklistItemsDto: ReorderChecklistItemsDto,
  ): Promise<ChecklistItemEntity[]> {
    return this.tasksService.reorderChecklistItems(checklistId, reorderChecklistItemsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TaskEntity> {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.update(id, updateTaskDto, user.userId);
  }

  @Put(':id/move')
  move(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() moveTaskDto: MoveTaskDto,
  ): Promise<TaskEntity> {
    return this.tasksService.move(id, moveTaskDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.tasksService.remove(id, user.userId);
  }

  @Post(':id/archive')
  archive(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<TaskEntity> {
    return this.tasksService.archive(id, user.userId);
  }

  @Post(':id/unarchive')
  unarchive(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<TaskEntity> {
    return this.tasksService.unarchive(id, user.userId);
  }

  @Post(':id/assign')
  assignUser(
    @Param('id') taskId: string,
    @CurrentUser() user: { userId: string },
    @Body() assignTaskDto: AssignTaskDto,
  ): Promise<AssignmentEntity> {
    return this.tasksService.assignUser(taskId, assignTaskDto, user.userId);
  }

  @Delete(':id/assign/:userId')
  unassignUser(
    @Param('id') taskId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.tasksService.unassignUser(taskId, userId, user.userId);
  }

  @Post(':id/tags')
  addTag(
    @Param('id') taskId: string,
    @CurrentUser() user: { userId: string },
    @Body() addTagDto: AddTagToTaskDto,
  ): Promise<TaskTagEntity> {
    return this.tasksService.addTag(taskId, addTagDto, user.userId);
  }

  @Delete(':id/tags/:tagId')
  removeTag(
    @Param('id') taskId: string,
    @Param('tagId') tagId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.tasksService.removeTag(taskId, tagId, user.userId);
  }

  // Activity endpoints - must come before :id route

  @Get(':taskId/activities')
  async findAllActivities(
    @Param('taskId') taskId: string,
  ): Promise<ActivityResponseDto[]> {
    const activities = await this.activitiesService.findAllByTask(taskId);
    return activities.map((activity) => ({
      id: activity.id,
      taskId: activity.task.id,
      userId: activity.user.id,
      userEmail: activity.user.email,
      userName: activity.user.name,
      actionType: activity.actionType,
      oldValue: activity.oldValue,
      newValue: activity.newValue,
      createdAt: activity.createdAt,
    }));
  }
}