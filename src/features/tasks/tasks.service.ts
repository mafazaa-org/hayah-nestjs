import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { AddTagToTaskDto } from './dto/add-tag-to-task.dto';
import { ListEntity } from '../lists/entities/list.entity';
import { StatusEntity } from '../statuses/entities/status.entity';
import { TaskPriorityEntity } from './entities/task-priority.entity';
import { AssignmentEntity } from './entities/assignment.entity';
import { TaskTagEntity } from './entities/task-tag.entity';
import { TagEntity } from '../tags/entities/tag.entity';
import { SubtaskEntity } from './entities/subtask.entity';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { MoveSubtaskDto } from './dto/move-subtask.dto';
import { ChecklistEntity } from './entities/checklist.entity';
import { ChecklistItemEntity } from './entities/checklist-item.entity';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ReorderChecklistItemsDto } from './dto/reorder-checklist-items.dto';
import { FilterTasksDto, FilterConditionDto, FilterGroupDto, FilterOperator } from './dto/filter-tasks.dto';
import { SearchTasksDto } from './dto/search-tasks.dto';
import { SortField, SortDirection } from './dto/sort-tasks.dto';
import { CreateTaskDependencyDto } from './dto/create-task-dependency.dto';
import { TaskDependencyEntity } from './entities/task-dependency.entity';
import { CreateTaskCustomFieldValueDto } from './dto/create-task-custom-field-value.dto';
import { UpdateTaskCustomFieldValueDto } from './dto/update-task-custom-field-value.dto';
import { TaskCustomFieldValueEntity } from './entities/task-custom-field-value.entity';
import { CustomFieldEntity } from '../lists/entities/custom-field.entity';
import { Between, In } from 'typeorm';
import { ActivitiesService } from './services/activities.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';
import { EventsEmitterService } from '../events/events-emitter.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
    @InjectRepository(TaskPriorityEntity)
    private readonly priorityRepository: Repository<TaskPriorityEntity>,
    @InjectRepository(AssignmentEntity)
    private readonly assignmentRepository: Repository<AssignmentEntity>,
    @InjectRepository(TaskTagEntity)
    private readonly taskTagRepository: Repository<TaskTagEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(SubtaskEntity)
    private readonly subtaskRepository: Repository<SubtaskEntity>,
    @InjectRepository(ChecklistEntity)
    private readonly checklistRepository: Repository<ChecklistEntity>,
    @InjectRepository(ChecklistItemEntity)
    private readonly checklistItemRepository: Repository<ChecklistItemEntity>,
    @InjectRepository(TaskDependencyEntity)
    private readonly taskDependencyRepository: Repository<TaskDependencyEntity>,
    @InjectRepository(TaskCustomFieldValueEntity)
    private readonly taskCustomFieldValueRepository: Repository<TaskCustomFieldValueEntity>,
    @InjectRepository(CustomFieldEntity)
    private readonly customFieldRepository: Repository<CustomFieldEntity>,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
    private readonly eventsEmitter: EventsEmitterService,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId?: string,
  ): Promise<TaskEntity> {
    const {
      title,
      description,
      listId,
      statusId,
      priorityId,
      dueDate,
      orderPosition,
    } = createTaskDto;

    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Verify status exists if provided
    let status: StatusEntity | null = null;
    if (statusId) {
      status = await this.statusRepository.findOne({
        where: { id: statusId },
        relations: ['list'],
      });
      if (!status) {
        throw new NotFoundException('Status not found');
      }
      // Verify status belongs to the list
      if (status.list.id !== listId) {
        throw new BadRequestException(
          'Status does not belong to the specified list',
        );
      }
    }

    // Verify priority exists if provided
    let priority: TaskPriorityEntity | null = null;
    if (priorityId) {
      priority = await this.priorityRepository.findOne({
        where: { id: priorityId },
      });
      if (!priority) {
        throw new NotFoundException('Priority not found');
      }
    }

    // Calculate orderPosition if not provided
    let finalOrderPosition = orderPosition;
    if (finalOrderPosition === undefined && statusId) {
      const existingTasks = await this.taskRepository.find({
        where: { status: { id: statusId } },
        order: { orderPosition: 'DESC' },
        take: 1,
      });

      finalOrderPosition =
        existingTasks.length > 0 ? existingTasks[0].orderPosition + 1 : 0;
    } else if (finalOrderPosition === undefined) {
      finalOrderPosition = 0;
    }

    const task = this.taskRepository.create({
      title,
      description: description || null,
      list: { id: listId } as any,
      status: statusId ? ({ id: statusId } as any) : null,
      priority: priorityId ? ({ id: priorityId } as any) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      orderPosition: finalOrderPosition,
      isArchived: false,
    });

    const savedTask = await this.taskRepository.save(task);

    // Track activity
    if (userId) {
      await this.activitiesService.createActivity(
        savedTask.id,
        userId,
        'task_created',
        null,
        { title: savedTask.title },
      );
    }

    try {
      this.eventsEmitter.emitTaskCreated(listId, this.toTaskPayload(savedTask, listId));
    } catch {
      // Real-time emit must not break create
    }

    return savedTask;
  }

  private toTaskPayload(
    t: TaskEntity,
    listId?: string,
  ): Record<string, unknown> {
    const lid = listId ?? (t.list as ListEntity)?.id;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      listId: lid,
      statusId: t.status?.id ?? null,
      priorityId: t.priority?.id ?? null,
      dueDate: t.dueDate ? (t.dueDate as Date).toISOString() : null,
      orderPosition: t.orderPosition,
      isArchived: t.isArchived,
      createdAt: (t.createdAt as Date)?.toISOString?.(),
      updatedAt: (t.updatedAt as Date)?.toISOString?.(),
    };
  }

  async findAll(
    listId?: string,
    statusId?: string,
    includeArchived: boolean = false,
    sortField?: SortField,
    sortDirection: SortDirection = SortDirection.ASC,
    customFieldId?: string,
  ): Promise<TaskEntity[]> {
    // Use QueryBuilder for assignee sorting (complex - requires join)
    if (sortField === SortField.ASSIGNEE) {
      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.list', 'list')
        .leftJoinAndSelect('task.status', 'status')
        .leftJoinAndSelect('task.priority', 'priority')
        .leftJoinAndSelect('task.assignments', 'assignments')
        .leftJoinAndSelect('assignments.user', 'assignee')
        .leftJoinAndSelect('task.taskTags', 'taskTags');

      if (listId) {
        queryBuilder.andWhere('task.list.id = :listId', { listId });
      }

      if (statusId) {
        queryBuilder.andWhere('task.status.id = :statusId', { statusId });
      }

      if (!includeArchived) {
        queryBuilder.andWhere('task.isArchived = :isArchived', { isArchived: false });
      }

      // Sort by first assignee's name alphabetically
      // For ASC: use MIN to get first name alphabetically
      // For DESC: use MAX to get last name alphabetically
      const assigneeSortColumn =
        sortDirection === SortDirection.ASC
          ? 'MIN(assignee.name)'
          : 'MAX(assignee.name)';

      // Sort by first assignee's name alphabetically using subquery in ORDER BY
      const assigneeOrderBy =
        sortDirection === SortDirection.ASC
          ? '(SELECT MIN(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)'
          : '(SELECT MAX(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)';

      queryBuilder
        .orderBy(`CASE WHEN ${assigneeOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
        .addOrderBy(assigneeOrderBy, sortDirection)
        .addOrderBy('task.orderPosition', SortDirection.ASC);

      return queryBuilder.getMany();
    }

    // Use QueryBuilder for custom field sorting (complex - requires join)
    if (sortField === SortField.CUSTOM_FIELD) {
      if (!customFieldId) {
        throw new BadRequestException('customFieldId is required when sorting by customField');
      }

      // Verify custom field exists
      const customField = await this.customFieldRepository.findOne({
        where: { id: customFieldId },
        relations: ['list'],
      });

      if (!customField) {
        throw new NotFoundException('Custom field not found');
      }

      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.list', 'list')
        .leftJoinAndSelect('task.status', 'status')
        .leftJoinAndSelect('task.priority', 'priority')
        .leftJoinAndSelect('task.assignments', 'assignments')
        .leftJoinAndSelect('task.taskTags', 'taskTags')
        .leftJoin('task.taskCustomFieldValues', 'customFieldValue')
        .leftJoin('customFieldValue.customField', 'customField');

      if (listId) {
        queryBuilder.andWhere('task.list.id = :listId', { listId });
      }

      if (statusId) {
        queryBuilder.andWhere('task.status.id = :statusId', { statusId });
      }

      if (!includeArchived) {
        queryBuilder.andWhere('task.isArchived = :isArchived', { isArchived: false });
      }

      // Verify custom field belongs to the same list (if listId is provided)
      if (listId && customField.list.id !== listId) {
        throw new BadRequestException(
          'Custom field does not belong to the specified list',
        );
      }

      // Sort by custom field value based on type
      // For JSONB values, we need to extract and cast based on type
      let valueOrderBy: string;
      switch (customField.type) {
        case 'text':
        case 'dropdown':
          // Sort alphabetically
          valueOrderBy = `(SELECT cfv.value::text FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
          break;
        case 'number':
          // Sort numerically
          valueOrderBy = `(SELECT (cfv.value::jsonb)::numeric FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
          break;
        case 'date':
          // Sort by date
          valueOrderBy = `(SELECT (cfv.value::jsonb)::text::date FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
          break;
        default:
          throw new BadRequestException(`Unknown custom field type: ${customField.type}`);
      }

      queryBuilder
        .setParameter('customFieldId', customFieldId)
        .orderBy(`CASE WHEN ${valueOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
        .addOrderBy(valueOrderBy, sortDirection)
        .addOrderBy('task.orderPosition', SortDirection.ASC);

      return queryBuilder.getMany();
    }

    // Use simple find for other sort fields
    const where: any = {};

    if (listId) {
      where.list = { id: listId };
    }

    if (statusId) {
      where.status = { id: statusId };
    }

    if (!includeArchived) {
      where.isArchived = false;
    }

    const order: any = {};
    if (sortField) {
      // Map sort fields to entity properties
      const sortFieldMap: Partial<Record<SortField, string>> = {
        [SortField.DUE_DATE]: 'dueDate',
        [SortField.PRIORITY]: 'priority.orderIndex',
        [SortField.CREATED_AT]: 'createdAt',
        [SortField.UPDATED_AT]: 'updatedAt',
        [SortField.TITLE]: 'title',
        [SortField.ORDER_POSITION]: 'orderPosition',
        [SortField.ASSIGNEE]: 'assignee', // This won't be used here but kept for completeness
        [SortField.CUSTOM_FIELD]: 'customField', // This won't be used here but kept for completeness
      };

      const actualSortField = sortFieldMap[sortField];
      if (!actualSortField) {
        throw new BadRequestException(`Sort field ${sortField} requires custom handling and cannot be used with simple find`);
      }
      
      if (actualSortField.includes('.')) {
        // For nested fields like priority.orderIndex, we need QueryBuilder
        const queryBuilder = this.taskRepository
          .createQueryBuilder('task')
          .leftJoinAndSelect('task.list', 'list')
          .leftJoinAndSelect('task.status', 'status')
          .leftJoinAndSelect('task.priority', 'priority')
          .leftJoinAndSelect('task.assignments', 'assignments')
          .leftJoinAndSelect('task.taskTags', 'taskTags');

        if (listId) {
          queryBuilder.andWhere('task.list.id = :listId', { listId });
        }

        if (statusId) {
          queryBuilder.andWhere('task.status.id = :statusId', { statusId });
        }

        if (!includeArchived) {
          queryBuilder.andWhere('task.isArchived = :isArchived', { isArchived: false });
        }

        queryBuilder.orderBy(actualSortField, sortDirection);
        if (sortField !== SortField.ORDER_POSITION) {
          queryBuilder.addOrderBy('task.orderPosition', SortDirection.ASC);
        }

        return queryBuilder.getMany();
      } else {
        order[actualSortField] = sortDirection;
        // Add secondary sort by orderPosition for consistency, unless sorting by orderPosition
        if (sortField !== SortField.ORDER_POSITION) {
          order.orderPosition = SortDirection.ASC;
        }
      }
    } else {
      // Default sorting
      order.orderPosition = SortDirection.ASC;
      order.createdAt = SortDirection.ASC;
    }

    return this.taskRepository.find({
      where,
      relations: ['list', 'status', 'priority', 'assignments', 'taskTags'],
      order,
    });
  }

  async findOne(id: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'list',
        'status',
        'priority',
        'assignments',
        'assignments.user',
        'taskTags',
        'taskTags.tag',
        'subtasks',
        'checklists',
        'comments',
        'attachments',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId?: string,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['list', 'status', 'priority'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Store old values for activity tracking
    const oldValues: any = {
      title: task.title,
      description: task.description,
      statusId: task.status?.id || null,
      priorityId: task.priority?.id || null,
      dueDate: task.dueDate,
      orderPosition: task.orderPosition,
    };

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description || null;
    }

    if (updateTaskDto.statusId !== undefined) {
      if (updateTaskDto.statusId === null) {
        task.status = null;
      } else {
        const status = await this.statusRepository.findOne({
          where: { id: updateTaskDto.statusId },
          relations: ['list'],
        });
        if (!status) {
          throw new NotFoundException('Status not found');
        }
        // Verify status belongs to the same list
        if (status.list.id !== task.list.id) {
          throw new BadRequestException(
            'Status does not belong to the task\'s list',
          );
        }
        task.status = status;
      }
    }

    if (updateTaskDto.priorityId !== undefined) {
      if (updateTaskDto.priorityId === null) {
        task.priority = null;
      } else {
        const priority = await this.priorityRepository.findOne({
          where: { id: updateTaskDto.priorityId },
        });
        if (!priority) {
          throw new NotFoundException('Priority not found');
        }
        task.priority = priority;
      }
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    if (updateTaskDto.orderPosition !== undefined) {
      task.orderPosition = updateTaskDto.orderPosition;
    }

    const savedTask = await this.taskRepository.save(task);

    // Track activity - only log changed fields
    if (userId) {
      const newValues: any = {};
      const changedFields: string[] = [];

      if (updateTaskDto.title !== undefined && oldValues.title !== savedTask.title) {
        changedFields.push('title');
        newValues.title = savedTask.title;
      }
      if (updateTaskDto.description !== undefined && oldValues.description !== savedTask.description) {
        changedFields.push('description');
        newValues.description = savedTask.description;
      }
      if (updateTaskDto.statusId !== undefined) {
        const newStatusId = savedTask.status?.id || null;
        if (oldValues.statusId !== newStatusId) {
          changedFields.push('status');
          newValues.statusId = newStatusId;
        }
      }
      if (updateTaskDto.priorityId !== undefined) {
        const newPriorityId = savedTask.priority?.id || null;
        if (oldValues.priorityId !== newPriorityId) {
          changedFields.push('priority');
          newValues.priorityId = newPriorityId;
        }
      }
      if (updateTaskDto.dueDate !== undefined) {
        const newDueDate = savedTask.dueDate;
        if (oldValues.dueDate?.getTime() !== newDueDate?.getTime()) {
          changedFields.push('dueDate');
          newValues.dueDate = newDueDate;
        }
      }
      if (updateTaskDto.orderPosition !== undefined && oldValues.orderPosition !== savedTask.orderPosition) {
        changedFields.push('orderPosition');
        newValues.orderPosition = savedTask.orderPosition;
      }

      // Create activity entry for each changed field
      for (const field of changedFields) {
        await this.activitiesService.createActivity(
          savedTask.id,
          userId,
          `task_${field}_updated`,
          { [field]: oldValues[field] },
          { [field]: newValues[field] },
        );
      }
    }

    try {
      this.eventsEmitter.emitTaskUpdated(
        task.list.id,
        savedTask.id,
        this.toTaskPayload(savedTask),
      );
    } catch {
      // Real-time emit must not break update
    }

    return savedTask;
  }

  async remove(id: string, userId?: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const listId = task.list.id;

    // Track activity before deletion
    if (userId) {
      await this.activitiesService.createActivity(
        id,
        userId,
        'task_deleted',
        { title: task.title },
        null,
      );
    }

    // Cascade delete will handle related entities (subtasks, comments, attachments, etc.)
    await this.taskRepository.remove(task);

    try {
      this.eventsEmitter.emitTaskDeleted(listId, id);
    } catch {
      // Real-time emit must not break delete
    }
  }

  async move(
    id: string,
    moveTaskDto: MoveTaskDto,
    userId?: string,
  ): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['list', 'status'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const oldStatusId = task.status?.id || null;
    const oldOrderPosition = task.orderPosition;

    if (moveTaskDto.statusId !== undefined) {
      if (moveTaskDto.statusId === null) {
        task.status = null;
      } else {
        const status = await this.statusRepository.findOne({
          where: { id: moveTaskDto.statusId },
          relations: ['list'],
        });
        if (!status) {
          throw new NotFoundException('Status not found');
        }
        // Verify status belongs to the same list
        if (status.list.id !== task.list.id) {
          throw new BadRequestException(
            'Cannot move task to status in different list',
          );
        }
        task.status = status;
      }
    }

    if (moveTaskDto.orderPosition !== undefined) {
      task.orderPosition = moveTaskDto.orderPosition;
    } else if (moveTaskDto.statusId !== undefined && moveTaskDto.statusId !== null) {
      // Auto-calculate order position for new status
      const existingTasks = await this.taskRepository.find({
        where: { status: { id: moveTaskDto.statusId } },
        order: { orderPosition: 'DESC' },
        take: 1,
      });

      task.orderPosition =
        existingTasks.length > 0 ? existingTasks[0].orderPosition + 1 : 0;
    }

    const savedTask = await this.taskRepository.save(task);

    // Track activity
    if (userId) {
      if (moveTaskDto.statusId !== undefined) {
        const newStatusId = savedTask.status?.id || null;
        if (oldStatusId !== newStatusId) {
          await this.activitiesService.createActivity(
            savedTask.id,
            userId,
            'task_status_changed',
            { statusId: oldStatusId },
            { statusId: newStatusId },
          );

          // Notify assignees of status change (exclude actor)
          try {
            const assignments = await this.assignmentRepository.find({
              where: { task: { id: savedTask.id } },
              relations: ['user'],
            });
            const assigneeIds = assignments
              .map((a) => a.user.id)
              .filter((id) => id !== userId);
            if (assigneeIds.length > 0) {
              await this.notificationsService.createForUsers(
                assigneeIds,
                NotificationType.TASK_STATUS_CHANGE,
                'Task status updated',
                `Task "${savedTask.title}" status was changed`,
                savedTask.id,
              );
            }
          } catch {
            // Notification failure should not break move
          }
        }
      }
      if (moveTaskDto.orderPosition !== undefined || (moveTaskDto.statusId !== undefined && oldOrderPosition !== savedTask.orderPosition)) {
        if (oldOrderPosition !== savedTask.orderPosition) {
          await this.activitiesService.createActivity(
            savedTask.id,
            userId,
            'task_position_changed',
            { orderPosition: oldOrderPosition },
            { orderPosition: savedTask.orderPosition },
          );
        }
      }
    }

    try {
      this.eventsEmitter.emitTaskMoved(
        task.list.id,
        savedTask.id,
        this.toTaskPayload(savedTask),
      );
    } catch {
      // Real-time emit must not break move
    }

    return savedTask;
  }

  async archive(id: string, userId?: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.isArchived) {
      throw new BadRequestException('Task is already archived');
    }

    task.isArchived = true;
    const savedTask = await this.taskRepository.save(task);

    // Track activity
    if (userId) {
      await this.activitiesService.createActivity(
        savedTask.id,
        userId,
        'task_archived',
        { isArchived: false },
        { isArchived: true },
      );
    }

    return savedTask;
  }

  async unarchive(id: string, userId?: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.isArchived) {
      throw new BadRequestException('Task is not archived');
    }

    task.isArchived = false;
    const savedTask = await this.taskRepository.save(task);

    // Track activity
    if (userId) {
      await this.activitiesService.createActivity(
        savedTask.id,
        userId,
        'task_unarchived',
        { isArchived: true },
        { isArchived: false },
      );
    }

    return savedTask;
  }

  async assignUser(
    taskId: string,
    assignTaskDto: AssignTaskDto,
    actorUserId?: string,
  ): Promise<AssignmentEntity> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.assignmentRepository.findOne({
      where: {
        task: { id: taskId },
        user: { id: assignTaskDto.userId },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('User is already assigned to this task');
    }

    const assignment = this.assignmentRepository.create({
      task: { id: taskId } as any,
      user: { id: assignTaskDto.userId } as any,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Track activity
    if (actorUserId) {
      await this.activitiesService.createActivity(
        taskId,
        actorUserId,
        'task_user_assigned',
        null,
        { userId: assignTaskDto.userId },
      );
    }

    // Notify assignee (unless they assigned themselves)
    const assigneeId = assignTaskDto.userId;
    if (assigneeId !== actorUserId) {
      try {
        await this.notificationsService.create(
          assigneeId,
          NotificationType.TASK_ASSIGNMENT,
          'Task assignment',
          `You were assigned to task "${task.title}"`,
          taskId,
        );
      } catch {
        // Notification failure should not break assignment
      }
    }

    try {
      this.eventsEmitter.emitTaskAssigned(task.list.id, taskId, assigneeId);
    } catch {
      // Real-time emit must not break assign
    }

    return savedAssignment;
  }

  async unassignUser(
    taskId: string,
    userId: string,
    actorUserId?: string,
  ): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: {
        task: { id: taskId },
        user: { id: userId },
      },
      relations: ['task', 'task.list'],
    });

    if (!assignment) {
      throw new NotFoundException(
        'Assignment not found (user is not assigned to this task)',
      );
    }

    const listId = assignment.task.list.id;

    await this.assignmentRepository.remove(assignment);

    // Track activity
    if (actorUserId) {
      await this.activitiesService.createActivity(
        taskId,
        actorUserId,
        'task_user_unassigned',
        { userId },
        null,
      );
    }

    try {
      this.eventsEmitter.emitTaskUnassigned(listId, taskId, userId);
    } catch {
      // Real-time emit must not break unassign
    }
  }

  async addTag(
    taskId: string,
    addTagDto: AddTagToTaskDto,
    userId?: string,
  ): Promise<TaskTagEntity> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const tag = await this.tagRepository.findOne({
      where: { id: addTagDto.tagId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if tag is already assigned
    const existingTaskTag = await this.taskTagRepository.findOne({
      where: {
        task: { id: taskId },
        tag: { id: addTagDto.tagId },
      },
    });

    if (existingTaskTag) {
      throw new BadRequestException('Tag is already assigned to this task');
    }

    const taskTag = this.taskTagRepository.create({
      task: { id: taskId } as any,
      tag: { id: addTagDto.tagId } as any,
    });

    const savedTaskTag = await this.taskTagRepository.save(taskTag);

    // Track activity
    if (userId) {
      await this.activitiesService.createActivity(
        taskId,
        userId,
        'task_tag_added',
        null,
        { tagId: addTagDto.tagId, tagName: tag.name },
      );
    }

    return savedTaskTag;
  }

  async removeTag(
    taskId: string,
    tagId: string,
    userId?: string,
  ): Promise<void> {
    const taskTag = await this.taskTagRepository.findOne({
      where: {
        task: { id: taskId },
        tag: { id: tagId },
      },
      relations: ['tag'],
    });

    if (!taskTag) {
      throw new NotFoundException(
        'Task tag not found (tag is not assigned to this task)',
      );
    }

    const tagName = taskTag.tag.name;

    await this.taskTagRepository.remove(taskTag);

    // Track activity
    if (userId) {
      await this.activitiesService.createActivity(
        taskId,
        userId,
        'task_tag_removed',
        { tagId, tagName },
        null,
      );
    }
  }

  // Subtask methods
  async createSubtask(createSubtaskDto: CreateSubtaskDto): Promise<SubtaskEntity> {
    const { title, taskId, orderIndex } = createSubtaskDto;

    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Calculate orderIndex if not provided
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const existingSubtasks = await this.subtaskRepository.find({
        where: { task: { id: taskId } },
        order: { orderIndex: 'DESC' },
        take: 1,
      });

      finalOrderIndex =
        existingSubtasks.length > 0 ? existingSubtasks[0].orderIndex + 1 : 0;
    }

    const subtask = this.subtaskRepository.create({
      title,
      task: { id: taskId } as any,
      isCompleted: false,
      orderIndex: finalOrderIndex,
    });

    return this.subtaskRepository.save(subtask);
  }

  async findAllSubtasks(taskId: string): Promise<SubtaskEntity[]> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.subtaskRepository.find({
      where: { task: { id: taskId } },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneSubtask(id: string): Promise<SubtaskEntity> {
    const subtask = await this.subtaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    return subtask;
  }

  async updateSubtask(id: string, updateSubtaskDto: UpdateSubtaskDto): Promise<SubtaskEntity> {
    const subtask = await this.subtaskRepository.findOne({ where: { id } });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    if (updateSubtaskDto.title !== undefined) {
      subtask.title = updateSubtaskDto.title;
    }

    if (updateSubtaskDto.isCompleted !== undefined) {
      subtask.isCompleted = updateSubtaskDto.isCompleted;
    }

    if (updateSubtaskDto.orderIndex !== undefined) {
      subtask.orderIndex = updateSubtaskDto.orderIndex;
    }

    return this.subtaskRepository.save(subtask);
  }

  async removeSubtask(id: string): Promise<void> {
    const subtask = await this.subtaskRepository.findOne({ where: { id } });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    await this.subtaskRepository.remove(subtask);
  }

  async moveSubtask(id: string, moveSubtaskDto: MoveSubtaskDto): Promise<SubtaskEntity> {
    const subtask = await this.subtaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }

    // Verify target task exists
    const targetTask = await this.taskRepository.findOne({
      where: { id: moveSubtaskDto.targetTaskId },
    });
    if (!targetTask) {
      throw new NotFoundException('Target task not found');
    }

    // Verify target task is in the same list as the source task
    const sourceTask = await this.taskRepository.findOne({
      where: { id: subtask.task.id },
      relations: ['list'],
    });

    if (!sourceTask) {
      throw new NotFoundException('Source task not found');
    }

    const targetTaskWithList = await this.taskRepository.findOne({
      where: { id: moveSubtaskDto.targetTaskId },
      relations: ['list'],
    });

    if (!targetTaskWithList) {
      throw new NotFoundException('Target task not found');
    }

    if (sourceTask.list.id !== targetTaskWithList.list.id) {
      throw new BadRequestException(
        'Cannot move subtask to a task in a different list',
      );
    }

    subtask.task = targetTask;

    // Calculate orderIndex if not provided
    if (moveSubtaskDto.orderIndex !== undefined) {
      subtask.orderIndex = moveSubtaskDto.orderIndex;
    } else {
      // Auto-calculate order position in new task
      const existingSubtasks = await this.subtaskRepository.find({
        where: { task: { id: moveSubtaskDto.targetTaskId } },
        order: { orderIndex: 'DESC' },
        take: 1,
      });

      subtask.orderIndex =
        existingSubtasks.length > 0 ? existingSubtasks[0].orderIndex + 1 : 0;
    }

    return this.subtaskRepository.save(subtask);
  }

  // Checklist methods
  async createChecklist(createChecklistDto: CreateChecklistDto): Promise<ChecklistEntity> {
    const { title, taskId, orderIndex } = createChecklistDto;

    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Calculate orderIndex if not provided
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const existingChecklists = await this.checklistRepository.find({
        where: { task: { id: taskId } },
        order: { orderIndex: 'DESC' },
        take: 1,
      });

      finalOrderIndex =
        existingChecklists.length > 0 ? existingChecklists[0].orderIndex + 1 : 0;
    }

    const checklist = this.checklistRepository.create({
      title,
      task: { id: taskId } as any,
      orderIndex: finalOrderIndex,
    });

    return this.checklistRepository.save(checklist);
  }

  async findAllChecklists(taskId: string): Promise<ChecklistEntity[]> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.checklistRepository.find({
      where: { task: { id: taskId } },
      relations: ['checklistItems'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneChecklist(id: string): Promise<ChecklistEntity> {
    const checklist = await this.checklistRepository.findOne({
      where: { id },
      relations: ['task', 'checklistItems'],
      order: {
        checklistItems: {
          orderIndex: 'ASC',
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    return checklist;
  }

  async updateChecklist(
    id: string,
    updateChecklistDto: UpdateChecklistDto,
  ): Promise<ChecklistEntity> {
    const checklist = await this.checklistRepository.findOne({ where: { id } });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    if (updateChecklistDto.title !== undefined) {
      checklist.title = updateChecklistDto.title;
    }

    if (updateChecklistDto.orderIndex !== undefined) {
      checklist.orderIndex = updateChecklistDto.orderIndex;
    }

    return this.checklistRepository.save(checklist);
  }

  async removeChecklist(id: string): Promise<void> {
    const checklist = await this.checklistRepository.findOne({ where: { id } });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    // Cascade delete will handle checklist items
    await this.checklistRepository.remove(checklist);
  }

  // Checklist Item methods
  async createChecklistItem(
    createChecklistItemDto: CreateChecklistItemDto,
  ): Promise<ChecklistItemEntity> {
    const { title, checklistId, orderIndex } = createChecklistItemDto;

    // Verify checklist exists
    const checklist = await this.checklistRepository.findOne({
      where: { id: checklistId },
    });
    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    // Calculate orderIndex if not provided
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      const existingItems = await this.checklistItemRepository.find({
        where: { checklist: { id: checklistId } },
        order: { orderIndex: 'DESC' },
        take: 1,
      });

      finalOrderIndex =
        existingItems.length > 0 ? existingItems[0].orderIndex + 1 : 0;
    }

    const checklistItem = this.checklistItemRepository.create({
      title,
      checklist: { id: checklistId } as any,
      isCompleted: false,
      orderIndex: finalOrderIndex,
    });

    return this.checklistItemRepository.save(checklistItem);
  }

  async findAllChecklistItems(checklistId: string): Promise<ChecklistItemEntity[]> {
    // Verify checklist exists
    const checklist = await this.checklistRepository.findOne({
      where: { id: checklistId },
    });
    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    return this.checklistItemRepository.find({
      where: { checklist: { id: checklistId } },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOneChecklistItem(id: string): Promise<ChecklistItemEntity> {
    const checklistItem = await this.checklistItemRepository.findOne({
      where: { id },
      relations: ['checklist'],
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    return checklistItem;
  }

  async updateChecklistItem(
    id: string,
    updateChecklistItemDto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemEntity> {
    const checklistItem = await this.checklistItemRepository.findOne({
      where: { id },
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    if (updateChecklistItemDto.title !== undefined) {
      checklistItem.title = updateChecklistItemDto.title;
    }

    if (updateChecklistItemDto.isCompleted !== undefined) {
      checklistItem.isCompleted = updateChecklistItemDto.isCompleted;
    }

    if (updateChecklistItemDto.orderIndex !== undefined) {
      checklistItem.orderIndex = updateChecklistItemDto.orderIndex;
    }

    return this.checklistItemRepository.save(checklistItem);
  }

  async removeChecklistItem(id: string): Promise<void> {
    const checklistItem = await this.checklistItemRepository.findOne({
      where: { id },
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.checklistItemRepository.remove(checklistItem);
  }

  async reorderChecklistItems(
    checklistId: string,
    reorderChecklistItemsDto: ReorderChecklistItemsDto,
  ): Promise<ChecklistItemEntity[]> {
    // Verify checklist exists
    const checklist = await this.checklistRepository.findOne({
      where: { id: checklistId },
    });
    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    const itemIds = reorderChecklistItemsDto.itemOrders.map((item) => item.itemId);

    // Verify all items exist and belong to the checklist
    const items = await this.checklistItemRepository.find({
      where: {
        id: In(itemIds),
        checklist: { id: checklistId },
      },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException(
        'One or more checklist items not found or do not belong to this checklist',
      );
    }

    // Update orderIndex for each item
    const updatePromises = reorderChecklistItemsDto.itemOrders.map((itemOrder) => {
      const item = items.find((i) => i.id === itemOrder.itemId);
      if (item) {
        item.orderIndex = itemOrder.orderIndex;
        return this.checklistItemRepository.save(item);
      }
    });

    await Promise.all(updatePromises);

    // Return updated items ordered by orderIndex
    return this.checklistItemRepository.find({
      where: { checklist: { id: checklistId } },
      order: { orderIndex: 'ASC' },
    });
  }

  // Filtering & Search methods
  async filterTasks(
    filterTasksDto: FilterTasksDto,
    sortField?: SortField,
    sortDirection: SortDirection = SortDirection.ASC,
    customFieldId?: string,
  ): Promise<TaskEntity[]> {
    const { listId, filters, includeArchived } = filterTasksDto;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.list', 'list')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.priority', 'priority')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .leftJoinAndSelect('assignments.user', 'assignee')
      .leftJoinAndSelect('task.taskTags', 'taskTags')
      .leftJoinAndSelect('taskTags.tag', 'tag');

    // Base filters
    if (listId) {
      queryBuilder.andWhere('task.list.id = :listId', { listId });
    }

    if (!includeArchived) {
      queryBuilder.andWhere('task.isArchived = :isArchived', { isArchived: false });
    }

    // Apply complex filters
    if (filters) {
      const customFieldIds = this.collectCustomFieldIds(filters);
      let customFieldMap = new Map<string, { type: string }>();
      if (customFieldIds.size > 0) {
        const customFields = await this.customFieldRepository.find({
          where: { id: In(Array.from(customFieldIds)) },
          relations: ['list'],
        });
        for (const cf of customFields) {
          if (listId && (cf.list as any)?.id !== listId) {
            throw new BadRequestException(
              `Custom field ${cf.id} does not belong to the specified list`,
            );
          }
          customFieldMap.set(cf.id, { type: cf.type });
        }
        const foundIds = new Set(customFields.map((c) => c.id));
        const missing = Array.from(customFieldIds).filter((id) => !foundIds.has(id));
        if (missing.length) {
          throw new BadRequestException(
            `Custom field(s) not found: ${missing.join(', ')}`,
          );
        }
      }
      const context = { customFields: customFieldMap, paramCounter: 0 };
      this.applyFilterGroup(queryBuilder, filters, 'and', context);
    }

    // Apply sorting
    if (sortField) {
      const sortFieldMap: Record<SortField, string> = {
        [SortField.DUE_DATE]: 'task.dueDate',
        [SortField.PRIORITY]: 'priority.orderIndex',
        [SortField.CREATED_AT]: 'task.createdAt',
        [SortField.UPDATED_AT]: 'task.updatedAt',
        [SortField.TITLE]: 'task.title',
        [SortField.ORDER_POSITION]: 'task.orderPosition',
        [SortField.ASSIGNEE]: 'assignee.name', // Will be handled specially below
        [SortField.CUSTOM_FIELD]: 'customFieldValue.value', // Will be handled specially below
      };

      if (sortField === SortField.ASSIGNEE) {
        // Sort by first assignee's name alphabetically using subquery in ORDER BY
        const assigneeOrderBy =
          sortDirection === SortDirection.ASC
            ? '(SELECT MIN(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)'
            : '(SELECT MAX(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)';

        queryBuilder
          .orderBy(`CASE WHEN ${assigneeOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
          .addOrderBy(assigneeOrderBy, sortDirection);
      } else if (sortField === SortField.CUSTOM_FIELD) {
        if (!customFieldId) {
          throw new BadRequestException('customFieldId is required when sorting by customField');
        }

        // Verify custom field exists
        const customField = await this.customFieldRepository.findOne({
          where: { id: customFieldId },
          relations: ['list'],
        });

        if (!customField) {
          throw new NotFoundException('Custom field not found');
        }

        // Verify custom field belongs to the same list (if listId is provided)
        if (listId && customField.list.id !== listId) {
          throw new BadRequestException(
            'Custom field does not belong to the specified list',
          );
        }

        // Sort by custom field value based on type
        let valueOrderBy: string;
        switch (customField.type) {
          case 'text':
          case 'dropdown':
            // Sort alphabetically
            valueOrderBy = `(SELECT cfv.value::text FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          case 'number':
            // Sort numerically
            valueOrderBy = `(SELECT (cfv.value::jsonb)::numeric FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          case 'date':
            // Sort by date
            valueOrderBy = `(SELECT (cfv.value::jsonb)::text::date FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          default:
            throw new BadRequestException(`Unknown custom field type: ${customField.type}`);
        }

        queryBuilder
          .setParameter('customFieldId', customFieldId)
          .orderBy(`CASE WHEN ${valueOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
          .addOrderBy(valueOrderBy, sortDirection);
      } else {
        queryBuilder.orderBy(sortFieldMap[sortField], sortDirection);
      }

      // Add secondary sort by orderPosition unless sorting by it
      if (sortField !== SortField.ORDER_POSITION) {
        queryBuilder.addOrderBy('task.orderPosition', SortDirection.ASC);
      }
    } else {
      // Default sorting
      queryBuilder
        .orderBy('task.orderPosition', 'ASC')
        .addOrderBy('task.createdAt', 'ASC');
    }

    return queryBuilder.getMany();
  }

  private collectCustomFieldIds(filterGroup: FilterGroupDto): Set<string> {
    const ids = new Set<string>();
    const visit = (g: FilterGroupDto) => {
      for (const c of g.conditions ?? []) {
        if (c.field === 'customField' && c.customFieldId) ids.add(c.customFieldId);
      }
      for (const nested of g.groups ?? []) visit(nested);
    };
    visit(filterGroup);
    return ids;
  }

  private applyFilterGroup(
    queryBuilder: any,
    filterGroup: FilterGroupDto,
    defaultLogic: 'and' | 'or' = 'and',
    context?: { customFields: Map<string, { type: string }>; paramCounter: number },
  ): void {
    const logic = filterGroup.logic || defaultLogic;

    // Handle nested groups
    if (filterGroup.groups && filterGroup.groups.length > 0) {
      filterGroup.groups.forEach((nestedGroup, groupIndex) => {
        if (groupIndex === 0) {
          queryBuilder[logic === 'or' ? 'orWhere' : 'andWhere']((qb: any) => {
            this.applyFilterGroup(qb, nestedGroup, nestedGroup.logic, context);
          });
        } else {
          queryBuilder[logic === 'or' ? 'orWhere' : 'andWhere']((qb: any) => {
            this.applyFilterGroup(qb, nestedGroup, nestedGroup.logic, context);
          });
        }
      });
    }

    // Handle conditions
    if (filterGroup.conditions && filterGroup.conditions.length > 0) {
      filterGroup.conditions.forEach((condition, index) => {
        this.applyFilterCondition(
          queryBuilder,
          condition,
          logic,
          index > 0 || (filterGroup.groups && filterGroup.groups.length > 0),
          context,
        );
      });
    }
  }

  private applyFilterCondition(
    queryBuilder: any,
    condition: FilterConditionDto,
    logic: 'and' | 'or',
    useOr: boolean = false,
    context?: { customFields: Map<string, { type: string }>; paramCounter: number },
  ): void {
    const method = useOr ? 'orWhere' : 'andWhere';

    switch (condition.field) {
      case 'assignee':
        this.applyAssigneeFilter(queryBuilder, condition, method);
        break;
      case 'status':
        this.applyStatusFilter(queryBuilder, condition, method);
        break;
      case 'priority':
        this.applyPriorityFilter(queryBuilder, condition, method);
        break;
      case 'tag':
        this.applyTagFilter(queryBuilder, condition, method);
        break;
      case 'dueDate':
        this.applyDueDateFilter(queryBuilder, condition, method);
        break;
      case 'list':
        this.applyListFilter(queryBuilder, condition, method);
        break;
      case 'isArchived':
        this.applyArchivedFilter(queryBuilder, condition, method);
        break;
      case 'customField':
        if (context) {
          const idx = context.paramCounter++;
          this.applyCustomFieldFilter(queryBuilder, condition, method, context, idx);
        }
        break;
    }
  }

  private applyAssigneeFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    const subQuery = this.taskRepository
      .createQueryBuilder('task2')
      .innerJoin('task2.assignments', 'assignment')
      .where('assignment.user.id = :userId', { userId: condition.value })
      .andWhere('task2.id = task.id')
      .select('1')
      .limit(1);

    switch (condition.operator) {
      case FilterOperator.EQUALS:
      case FilterOperator.IN:
        queryBuilder[method](`EXISTS (${subQuery.getQuery()})`);
        break;
      case FilterOperator.NOT_EQUALS:
      case FilterOperator.NOT_IN:
        queryBuilder[method](`NOT EXISTS (${subQuery.getQuery()})`);
        break;
      case FilterOperator.IS_NULL:
        queryBuilder[method]((qb: any) => {
          qb.whereNotExists(subQuery);
        });
        break;
      case FilterOperator.IS_NOT_NULL:
        queryBuilder[method](`EXISTS (${subQuery.getQuery()})`);
        break;
    }
  }

  private applyStatusFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    switch (condition.operator) {
      case FilterOperator.EQUALS:
        queryBuilder[method]('task.status.id = :statusId', { statusId: condition.value });
        break;
      case FilterOperator.NOT_EQUALS:
        queryBuilder[method]('task.status.id != :statusId', { statusId: condition.value });
        break;
      case FilterOperator.IN:
        queryBuilder[method]('task.status.id IN (:...statusIds)', { statusIds: condition.value });
        break;
      case FilterOperator.NOT_IN:
        queryBuilder[method]('task.status.id NOT IN (:...statusIds)', { statusIds: condition.value });
        break;
      case FilterOperator.IS_NULL:
        queryBuilder[method]('task.status IS NULL');
        break;
      case FilterOperator.IS_NOT_NULL:
        queryBuilder[method]('task.status IS NOT NULL');
        break;
    }
  }

  private applyPriorityFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    switch (condition.operator) {
      case FilterOperator.EQUALS:
        queryBuilder[method]('task.priority.id = :priorityId', { priorityId: condition.value });
        break;
      case FilterOperator.NOT_EQUALS:
        queryBuilder[method]('task.priority.id != :priorityId', { priorityId: condition.value });
        break;
      case FilterOperator.IN:
        queryBuilder[method]('task.priority.id IN (:...priorityIds)', { priorityIds: condition.value });
        break;
      case FilterOperator.NOT_IN:
        queryBuilder[method]('task.priority.id NOT IN (:...priorityIds)', { priorityIds: condition.value });
        break;
      case FilterOperator.IS_NULL:
        queryBuilder[method]('task.priority IS NULL');
        break;
      case FilterOperator.IS_NOT_NULL:
        queryBuilder[method]('task.priority IS NOT NULL');
        break;
    }
  }

  private applyTagFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    const subQuery = this.taskRepository
      .createQueryBuilder('task2')
      .innerJoin('task2.taskTags', 'taskTag')
      .where('taskTag.tag.id = :tagId', { tagId: condition.value })
      .andWhere('task2.id = task.id')
      .select('1')
      .limit(1);

    switch (condition.operator) {
      case FilterOperator.EQUALS:
      case FilterOperator.IN:
        if (Array.isArray(condition.value)) {
          const tagIds = condition.value as string[];
          queryBuilder[method]((qb: any) => {
            qb.where((subQb: any) => {
              tagIds.forEach((tagId, index) => {
                const tagSubQuery = this.taskRepository
                  .createQueryBuilder('task3')
                  .innerJoin('task3.taskTags', 'taskTag3')
                  .where('taskTag3.tag.id = :tagId', { tagId })
                  .andWhere('task3.id = task.id')
                  .select('1')
                  .limit(1);
                if (index === 0) {
                  subQb.where(`EXISTS (${tagSubQuery.getQuery()})`);
                } else {
                  subQb.orWhere(`EXISTS (${tagSubQuery.getQuery()})`);
                }
              });
            });
          });
        } else {
          queryBuilder[method](`EXISTS (${subQuery.getQuery()})`);
        }
        break;
      case FilterOperator.NOT_EQUALS:
      case FilterOperator.NOT_IN:
        queryBuilder[method](`NOT EXISTS (${subQuery.getQuery()})`);
        break;
    }
  }

  private applyDueDateFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    const dateValue = condition.value instanceof Date 
      ? condition.value 
      : condition.value 
        ? new Date(condition.value as string)
        : null;

    switch (condition.operator) {
      case FilterOperator.EQUALS:
        queryBuilder[method]('DATE(task.dueDate) = DATE(:dueDate)', { dueDate: dateValue });
        break;
      case FilterOperator.GREATER_THAN:
        queryBuilder[method]('task.dueDate > :dueDate', { dueDate: dateValue });
        break;
      case FilterOperator.LESS_THAN:
        queryBuilder[method]('task.dueDate < :dueDate', { dueDate: dateValue });
        break;
      case FilterOperator.GREATER_THAN_OR_EQUAL:
        queryBuilder[method]('task.dueDate >= :dueDate', { dueDate: dateValue });
        break;
      case FilterOperator.LESS_THAN_OR_EQUAL:
        queryBuilder[method]('task.dueDate <= :dueDate', { dueDate: dateValue });
        break;
      case FilterOperator.IS_NULL:
        queryBuilder[method]('task.dueDate IS NULL');
        break;
      case FilterOperator.IS_NOT_NULL:
        queryBuilder[method]('task.dueDate IS NOT NULL');
        break;
    }
  }

  private applyListFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    switch (condition.operator) {
      case FilterOperator.EQUALS:
        queryBuilder[method]('task.list.id = :listId', { listId: condition.value });
        break;
      case FilterOperator.NOT_EQUALS:
        queryBuilder[method]('task.list.id != :listId', { listId: condition.value });
        break;
      case FilterOperator.IN:
        queryBuilder[method]('task.list.id IN (:...listIds)', { listIds: condition.value });
        break;
      case FilterOperator.NOT_IN:
        queryBuilder[method]('task.list.id NOT IN (:...listIds)', { listIds: condition.value });
        break;
    }
  }

  private applyArchivedFilter(queryBuilder: any, condition: FilterConditionDto, method: string): void {
    const isArchived = condition.value === true || condition.value === 'true';
    queryBuilder[method]('task.isArchived = :isArchived', { isArchived });
  }

  private applyCustomFieldFilter(
    queryBuilder: any,
    condition: FilterConditionDto,
    method: string,
    context: { customFields: Map<string, { type: string }>; paramCounter: number },
    idx: number,
  ): void {
    const cfId = condition.customFieldId!;
    const meta = context.customFields.get(cfId);
    if (!meta) {
      throw new BadRequestException(`Custom field ${cfId} not found or not usable for filtering`);
    }
    const t = meta.type;
    const cfIdParam = `cfId_${idx}`;
    const cfValParam = `cfVal_${idx}`;
    const cfValsParam = `cfVals_${idx}`;

    const base = `EXISTS (SELECT 1 FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :${cfIdParam}`;

    switch (condition.operator) {
      case FilterOperator.IS_NULL:
        queryBuilder[method](`NOT ${base})`, { [cfIdParam]: cfId });
        return;
      case FilterOperator.IS_NOT_NULL:
        queryBuilder[method](`${base})`, { [cfIdParam]: cfId });
        return;
    }

    const val = condition.value;
    if (val === undefined || val === null) return;

    if (t === 'text' || t === 'dropdown') {
      switch (condition.operator) {
        case FilterOperator.EQUALS:
          queryBuilder[method](
            `${base} AND (cfv.value #>> '{}') = :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: String(val) },
          );
          break;
        case FilterOperator.NOT_EQUALS:
          queryBuilder[method](
            `${base} AND (cfv.value #>> '{}') != :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: String(val) },
          );
          break;
        case FilterOperator.IN:
          if (Array.isArray(val)) {
            const arr = (val as unknown[]).map((x) => String(x));
            queryBuilder[method](
              `${base} AND (cfv.value #>> '{}') IN (:...${cfValsParam}))`,
              { [cfIdParam]: cfId, [cfValsParam]: arr },
            );
          }
          break;
        case FilterOperator.NOT_IN:
          if (Array.isArray(val)) {
            const arr = (val as unknown[]).map((x) => String(x));
            const baseNotIn = `EXISTS (SELECT 1 FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :${cfIdParam} AND (cfv.value #>> '{}') NOT IN (:...${cfValsParam}))`;
            queryBuilder[method](
              `(NOT ${base}) OR ${baseNotIn}`,
              { [cfIdParam]: cfId, [cfValsParam]: arr },
            );
          }
          break;
        case FilterOperator.CONTAINS:
          queryBuilder[method](
            `${base} AND (cfv.value #>> '{}') ILIKE :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: `%${String(val)}%` },
          );
          break;
        default:
          break;
      }
      return;
    }

    if (t === 'number') {
      const n = Array.isArray(val) ? Number((val as unknown[])[0]) : Number(val);
      if (Number.isNaN(n)) return;
      switch (condition.operator) {
        case FilterOperator.EQUALS:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) = :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        case FilterOperator.NOT_EQUALS:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) != :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        case FilterOperator.IN:
          if (Array.isArray(val)) {
            const arr = (val as unknown[]).map((x) => Number(x)).filter((x) => !Number.isNaN(x));
            if (arr.length) {
              queryBuilder[method](
                `${base} AND ((cfv.value #>> '{}')::numeric) IN (:...${cfValsParam}))`,
                { [cfIdParam]: cfId, [cfValsParam]: arr },
              );
            }
          }
          break;
        case FilterOperator.NOT_IN:
          if (Array.isArray(val)) {
            const arr = (val as unknown[]).map((x) => Number(x)).filter((x) => !Number.isNaN(x));
            if (arr.length) {
              const baseNotIn = `EXISTS (SELECT 1 FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :${cfIdParam} AND ((cfv.value #>> '{}')::numeric) NOT IN (:...${cfValsParam}))`;
              queryBuilder[method](
                `(NOT ${base}) OR ${baseNotIn}`,
                { [cfIdParam]: cfId, [cfValsParam]: arr },
              );
            }
          }
          break;
        case FilterOperator.GREATER_THAN:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) > :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        case FilterOperator.LESS_THAN:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) < :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        case FilterOperator.GREATER_THAN_OR_EQUAL:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) >= :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        case FilterOperator.LESS_THAN_OR_EQUAL:
          queryBuilder[method](
            `${base} AND ((cfv.value #>> '{}')::numeric) <= :${cfValParam})`,
            { [cfIdParam]: cfId, [cfValParam]: n },
          );
          break;
        default:
          break;
      }
      return;
    }

    if (t === 'date') {
      const d = Array.isArray(val) ? (val as string[])[0] : val;
      const dateVal = d instanceof Date ? d : new Date(d as string);
      if (isNaN(dateVal.getTime())) return;
      const iso = dateVal.toISOString().slice(0, 10);
      const dateCmp = (op: string) =>
        `${base} AND ((cfv.value #>> '{}')::date) ${op} CAST(:${cfValParam} AS date))`;
      switch (condition.operator) {
        case FilterOperator.EQUALS:
          queryBuilder[method](dateCmp('='), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        case FilterOperator.NOT_EQUALS:
          queryBuilder[method](dateCmp('!='), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        case FilterOperator.GREATER_THAN:
          queryBuilder[method](dateCmp('>'), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        case FilterOperator.LESS_THAN:
          queryBuilder[method](dateCmp('<'), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        case FilterOperator.GREATER_THAN_OR_EQUAL:
          queryBuilder[method](dateCmp('>='), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        case FilterOperator.LESS_THAN_OR_EQUAL:
          queryBuilder[method](dateCmp('<='), { [cfIdParam]: cfId, [cfValParam]: iso });
          break;
        default:
          break;
      }
    }
  }

  async searchTasks(
    searchTasksDto: SearchTasksDto,
    sortField?: SortField,
    sortDirection: SortDirection = SortDirection.ASC,
    customFieldId?: string,
  ): Promise<TaskEntity[]> {
    const { query, listId } = searchTasksDto;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.list', 'list')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.priority', 'priority')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .leftJoinAndSelect('assignments.user', 'assignee')
      .leftJoinAndSelect('task.taskTags', 'taskTags')
      .leftJoinAndSelect('taskTags.tag', 'tag')
      .where('task.isArchived = :isArchived', { isArchived: false })
      .andWhere(
        '(LOWER(task.title) LIKE LOWER(:query) OR LOWER(task.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );

    if (listId) {
      queryBuilder.andWhere('task.list.id = :listId', { listId });
    }

    // Apply sorting
    if (sortField) {
      const sortFieldMap: Record<SortField, string> = {
        [SortField.DUE_DATE]: 'task.dueDate',
        [SortField.PRIORITY]: 'priority.orderIndex',
        [SortField.CREATED_AT]: 'task.createdAt',
        [SortField.UPDATED_AT]: 'task.updatedAt',
        [SortField.TITLE]: 'task.title',
        [SortField.ORDER_POSITION]: 'task.orderPosition',
        [SortField.ASSIGNEE]: 'assignee.name', // Will be handled specially below
        [SortField.CUSTOM_FIELD]: 'customFieldValue.value', // Will be handled specially below
      };

      if (sortField === SortField.ASSIGNEE) {
        // Sort by first assignee's name alphabetically using subquery in ORDER BY
        const assigneeOrderBy =
          sortDirection === SortDirection.ASC
            ? '(SELECT MIN(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)'
            : '(SELECT MAX(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)';

        queryBuilder
          .orderBy(`CASE WHEN ${assigneeOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
          .addOrderBy(assigneeOrderBy, sortDirection);
      } else if (sortField === SortField.CUSTOM_FIELD) {
        if (!customFieldId) {
          throw new BadRequestException('customFieldId is required when sorting by customField');
        }

        // Verify custom field exists
        const customField = await this.customFieldRepository.findOne({
          where: { id: customFieldId },
          relations: ['list'],
        });

        if (!customField) {
          throw new NotFoundException('Custom field not found');
        }

        // Verify custom field belongs to the same list (if listId is provided)
        if (listId && customField.list.id !== listId) {
          throw new BadRequestException(
            'Custom field does not belong to the specified list',
          );
        }

        // Sort by custom field value based on type
        let valueOrderBy: string;
        switch (customField.type) {
          case 'text':
          case 'dropdown':
            // Sort alphabetically
            valueOrderBy = `(SELECT cfv.value::text FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          case 'number':
            // Sort numerically
            valueOrderBy = `(SELECT (cfv.value::jsonb)::numeric FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          case 'date':
            // Sort by date
            valueOrderBy = `(SELECT (cfv.value::jsonb)::text::date FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
            break;
          default:
            throw new BadRequestException(`Unknown custom field type: ${customField.type}`);
        }

        queryBuilder
          .setParameter('customFieldId', customFieldId)
          .orderBy(`CASE WHEN ${valueOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
          .addOrderBy(valueOrderBy, sortDirection);
      } else {
        queryBuilder.orderBy(sortFieldMap[sortField], sortDirection);
      }

      // Add secondary sort by orderPosition unless sorting by it
      if (sortField !== SortField.ORDER_POSITION) {
        queryBuilder.addOrderBy('task.orderPosition', SortDirection.ASC);
      }
    } else {
      // Default sorting
      queryBuilder
        .orderBy('task.orderPosition', 'ASC')
        .addOrderBy('task.createdAt', 'ASC');
    }

    return queryBuilder.getMany();
  }

  // Task Dependency methods
  async createTaskDependency(
    createTaskDependencyDto: CreateTaskDependencyDto,
  ): Promise<TaskDependencyEntity> {
    const { taskId, dependsOnTaskId, type } = createTaskDependencyDto;

    // Prevent self-dependency
    if (taskId === dependsOnTaskId) {
      throw new BadRequestException('A task cannot depend on itself');
    }

    // Verify both tasks exist
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const dependsOnTask = await this.taskRepository.findOne({
      where: { id: dependsOnTaskId },
      relations: ['list'],
    });
    if (!dependsOnTask) {
      throw new NotFoundException('Depends on task not found');
    }

    // Verify tasks are in the same list
    if (task.list.id !== dependsOnTask.list.id) {
      throw new BadRequestException(
        'Tasks must be in the same list to create a dependency',
      );
    }

    // Check if dependency already exists
    const existingDependency = await this.taskDependencyRepository.findOne({
      where: {
        task: { id: taskId },
        dependsOnTask: { id: dependsOnTaskId },
        type,
      },
    });

    if (existingDependency) {
      throw new BadRequestException(
        'This dependency already exists',
      );
    }

    // Check for circular dependencies using DFS
    const wouldCreateCycle = await this.wouldCreateCircularDependency(
      taskId,
      dependsOnTaskId,
      type,
    );

    if (wouldCreateCycle) {
      throw new BadRequestException(
        'Creating this dependency would create a circular dependency',
      );
    }

    const dependency = this.taskDependencyRepository.create({
      task: { id: taskId } as any,
      dependsOnTask: { id: dependsOnTaskId } as any,
      type,
    });

    return this.taskDependencyRepository.save(dependency);
  }

  private async wouldCreateCircularDependency(
    taskId: string,
    dependsOnTaskId: string,
    type: 'blocks' | 'blocked_by',
  ): Promise<boolean> {
    // Determine the dependency direction:
    // - If type is 'blocked_by': taskId is blocked by dependsOnTaskId, so taskId -> dependsOnTaskId
    // - If type is 'blocks': taskId blocks dependsOnTaskId, so dependsOnTaskId -> taskId
    
    let sourceTaskId: string;
    let targetTaskId: string;

    if (type === 'blocked_by') {
      // taskId depends on dependsOnTaskId (taskId -> dependsOnTaskId)
      sourceTaskId = taskId;
      targetTaskId = dependsOnTaskId;
    } else {
      // dependsOnTaskId depends on taskId (dependsOnTaskId -> taskId)
      sourceTaskId = dependsOnTaskId;
      targetTaskId = taskId;
    }

    // Check if there's already a path from targetTaskId to sourceTaskId
    // If yes, adding this dependency would create a cycle
    return this.hasPathToTask(targetTaskId, sourceTaskId);
  }

  private async hasPathToTask(
    fromTaskId: string,
    toTaskId: string,
  ): Promise<boolean> {
    if (fromTaskId === toTaskId) {
      return true;
    }

    // Use BFS to find if there's a path from fromTaskId to toTaskId in the dependency graph
    // We need to find all tasks that fromTaskId depends on (directly or indirectly)
    const visited = new Set<string>();
    const queue: string[] = [fromTaskId];
    visited.add(fromTaskId);

    while (queue.length > 0) {
      const currentTaskId = queue.shift()!;

      // Find all tasks that currentTaskId depends on
      // 1. Tasks that currentTaskId is blocked by (type='blocked_by', task=currentTaskId)
      //    This means currentTaskId depends on dependsOnTask
      const blockedByDeps = await this.taskDependencyRepository.find({
        where: {
          task: { id: currentTaskId },
          type: 'blocked_by',
        },
        relations: ['dependsOnTask'],
      });

      for (const dep of blockedByDeps) {
        const nextTaskId = dep.dependsOnTask.id;
        if (nextTaskId === toTaskId) {
          return true;
        }
        if (!visited.has(nextTaskId)) {
          visited.add(nextTaskId);
          queue.push(nextTaskId);
        }
      }

      // 2. Tasks that block currentTaskId (type='blocks', dependsOnTask=currentTaskId)
      //    This means the task blocks currentTaskId, so currentTaskId depends on that task
      const tasksBlockingCurrent = await this.taskDependencyRepository.find({
        where: {
          dependsOnTask: { id: currentTaskId },
          type: 'blocks',
        },
        relations: ['task'],
      });

      for (const dep of tasksBlockingCurrent) {
        const nextTaskId = dep.task.id;
        if (nextTaskId === toTaskId) {
          return true;
        }
        if (!visited.has(nextTaskId)) {
          visited.add(nextTaskId);
          queue.push(nextTaskId);
        }
      }
    }

    return false;
  }

  async findAllTaskDependencies(taskId: string): Promise<{
    blocking: TaskDependencyEntity[];
    blockedBy: TaskDependencyEntity[];
  }> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Tasks that this task depends on (blocked by):
    // - type='blocked_by', task=taskId: taskId depends on dependsOnTask
    // - type='blocks', dependsOnTask=taskId: task blocks taskId, so taskId depends on task
    const blockedBy1 = await this.taskDependencyRepository.find({
      where: {
        task: { id: taskId },
        type: 'blocked_by',
      },
      relations: ['dependsOnTask'],
      order: { createdAt: 'ASC' },
    });

    const blockedBy2 = await this.taskDependencyRepository.find({
      where: {
        dependsOnTask: { id: taskId },
        type: 'blocks',
      },
      relations: ['task'],
      order: { createdAt: 'ASC' },
    });

    // Tasks that depend on this task (this task blocks them):
    // - type='blocks', task=taskId: taskId blocks dependsOnTask, so dependsOnTask depends on taskId
    // - type='blocked_by', dependsOnTask=taskId: task is blocked by taskId, so task depends on taskId
    const blocking1 = await this.taskDependencyRepository.find({
      where: {
        task: { id: taskId },
        type: 'blocks',
      },
      relations: ['dependsOnTask'],
      order: { createdAt: 'ASC' },
    });

    const blocking2 = await this.taskDependencyRepository.find({
      where: {
        dependsOnTask: { id: taskId },
        type: 'blocked_by',
      },
      relations: ['task'],
      order: { createdAt: 'ASC' },
    });

    return {
      blocking: [...blocking1, ...blocking2],
      blockedBy: [...blockedBy1, ...blockedBy2],
    };
  }

  async findOneTaskDependency(id: string): Promise<TaskDependencyEntity> {
    const dependency = await this.taskDependencyRepository.findOne({
      where: { id },
      relations: ['task', 'dependsOnTask'],
    });

    if (!dependency) {
      throw new NotFoundException('Task dependency not found');
    }

    return dependency;
  }

  async removeTaskDependency(id: string): Promise<void> {
    const dependency = await this.taskDependencyRepository.findOne({
      where: { id },
    });

    if (!dependency) {
      throw new NotFoundException('Task dependency not found');
    }

    await this.taskDependencyRepository.remove(dependency);
  }

  // Task Custom Field Value methods
  async createTaskCustomFieldValue(
    createTaskCustomFieldValueDto: CreateTaskCustomFieldValueDto,
  ): Promise<TaskCustomFieldValueEntity> {
    const { taskId, customFieldId, value } = createTaskCustomFieldValueDto;

    // Verify task exists
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify custom field exists
    const customField = await this.customFieldRepository.findOne({
      where: { id: customFieldId },
      relations: ['list'],
    });
    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    // Verify custom field belongs to the same list as the task
    if (customField.list.id !== task.list.id) {
      throw new BadRequestException(
        'Custom field must belong to the same list as the task',
      );
    }

    // Validate value type based on custom field type
    this.validateCustomFieldValue(value, customField);

    // Check if value already exists for this task and custom field
    const existingValue = await this.taskCustomFieldValueRepository.findOne({
      where: {
        task: { id: taskId },
        customField: { id: customFieldId },
      },
    });

    if (existingValue) {
      throw new BadRequestException(
        'A value for this custom field already exists for this task. Use update instead.',
      );
    }

    const taskCustomFieldValue = this.taskCustomFieldValueRepository.create({
      task: { id: taskId } as any,
      customField: { id: customFieldId } as any,
      value,
    });

    return this.taskCustomFieldValueRepository.save(taskCustomFieldValue);
  }

  private validateCustomFieldValue(
    value: any,
    customField: CustomFieldEntity,
  ): void {
    switch (customField.type) {
      case 'text':
        if (typeof value !== 'string') {
          throw new BadRequestException(
            'Value must be a string for text custom field',
          );
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          throw new BadRequestException(
            'Value must be a number for number custom field',
          );
        }
        break;
      case 'date':
        // Accept string dates or Date objects
        if (typeof value !== 'string' && !(value instanceof Date)) {
          throw new BadRequestException(
            'Value must be a date string or Date object for date custom field',
          );
        }
        break;
      case 'dropdown':
        // For dropdown, value should be one of the options in config
        if (!customField.config?.options) {
          throw new BadRequestException(
            'Dropdown custom field must have options in config',
          );
        }
        if (!customField.config.options.includes(value)) {
          throw new BadRequestException(
            `Value must be one of: ${customField.config.options.join(', ')}`,
          );
        }
        break;
      default:
        throw new BadRequestException(`Unknown custom field type: ${customField.type}`);
    }
  }

  async findAllTaskCustomFieldValues(
    taskId: string,
  ): Promise<TaskCustomFieldValueEntity[]> {
    // Verify task exists
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskCustomFieldValueRepository.find({
      where: { task: { id: taskId } },
      relations: ['customField'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOneTaskCustomFieldValue(
    id: string,
  ): Promise<TaskCustomFieldValueEntity> {
    const taskCustomFieldValue =
      await this.taskCustomFieldValueRepository.findOne({
        where: { id },
        relations: ['task', 'customField'],
      });

    if (!taskCustomFieldValue) {
      throw new NotFoundException('Task custom field value not found');
    }

    return taskCustomFieldValue;
  }

  async updateTaskCustomFieldValue(
    id: string,
    updateTaskCustomFieldValueDto: UpdateTaskCustomFieldValueDto,
  ): Promise<TaskCustomFieldValueEntity> {
    const { value } = updateTaskCustomFieldValueDto;

    const taskCustomFieldValue =
      await this.taskCustomFieldValueRepository.findOne({
        where: { id },
        relations: ['customField'],
      });

    if (!taskCustomFieldValue) {
      throw new NotFoundException('Task custom field value not found');
    }

    // Validate value type based on custom field type
    if (value !== undefined) {
      this.validateCustomFieldValue(value, taskCustomFieldValue.customField);
      taskCustomFieldValue.value = value;
    }

    return this.taskCustomFieldValueRepository.save(taskCustomFieldValue);
  }

  async removeTaskCustomFieldValue(id: string): Promise<void> {
    const taskCustomFieldValue =
      await this.taskCustomFieldValueRepository.findOne({
        where: { id },
      });

    if (!taskCustomFieldValue) {
      throw new NotFoundException('Task custom field value not found');
    }

    await this.taskCustomFieldValueRepository.remove(taskCustomFieldValue);
  }

  /**
   * Get tasks with dueDate in [start, end] for a list. Used by Calendar and Timeline views.
   */
  async getTasksForCalendar(
    listId: string,
    start: string,
    end: string,
  ): Promise<TaskEntity[]> {
    if (!listId || !start || !end) {
      throw new BadRequestException('listId, start, and end are required');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('start and end must be valid ISO date strings');
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    return this.taskRepository.find({
      where: {
        list: { id: listId },
        dueDate: Between(startDate, endDate) as any,
        isArchived: false,
      },
      relations: ['list', 'status', 'priority', 'assignments', 'assignments.user'],
      order: { dueDate: 'ASC', orderPosition: 'ASC' },
    });
  }

  /**
   * Create due-date reminder notifications for tasks due in the next 24 hours.
   * Intended to be called by a cron job or scheduled task.
   * Assignees receive a TASK_DUE_REMINDER notification per task (respecting preferences).
   */
  async processDueReminders(): Promise<{ processed: number }> {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2); // today + tomorrow

    const tasks = await this.taskRepository.find({
      where: {
        dueDate: Between(start, end) as any,
        isArchived: false,
      },
      relations: ['assignments', 'assignments.user'],
    });

    let processed = 0;
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const assigneeIds = (task.assignments ?? []).map((a) => a.user.id);
      if (assigneeIds.length === 0) continue;
      try {
        await this.notificationsService.createForUsers(
          assigneeIds,
          NotificationType.TASK_DUE_REMINDER,
          'Task due soon',
          `Task "${task.title}" is due ${task.dueDate.toISOString().slice(0, 10)}`,
          task.id,
        );
        processed += assigneeIds.length;
      } catch {
        // Continue with other tasks
      }
    }
    return { processed };
  }
}