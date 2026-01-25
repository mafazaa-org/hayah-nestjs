import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Papa from 'papaparse';
import { ListEntity } from '../lists/entities/list.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { TaskPriorityEntity } from '../tasks/entities/task-priority.entity';
import { ListsService } from '../lists/lists.service';
import { TasksService } from '../tasks/tasks.service';
import { StatusesService } from '../statuses/statuses.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { SortDirection } from '../tasks/dto/sort-tasks.dto';
import { BulkCreateTasksDto, BulkCreateTaskItemDto } from './dto/bulk-create-tasks.dto';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { BulkDeleteTasksDto } from './dto/bulk-delete-tasks.dto';

const CSV_EXPORT_COLUMNS = [
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'orderPosition',
  'isArchived',
] as const;

export type ExportFormat = 'json' | 'csv';

export interface ExportResult {
  body: string | object;
  contentType: string;
  filename: string;
}

export interface ImportTasksResult {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: { index?: number; taskId?: string; message: string }[];
}

@Injectable()
export class ExportImportService {
  constructor(
    private readonly listsService: ListsService,
    private readonly tasksService: TasksService,
    private readonly statusesService: StatusesService,
    @InjectRepository(TaskPriorityEntity)
    private readonly priorityRepository: Repository<TaskPriorityEntity>,
  ) {}

  async ensureListAccess(listId: string, userId: string): Promise<void> {
    await this.listsService.checkUserPermission(listId, userId);
  }

  async exportList(
    listId: string,
    userId: string,
    format: ExportFormat,
  ): Promise<ExportResult> {
    await this.ensureListAccess(listId, userId);
    const list = await this.listsService.findOne(listId);
    const listData = list as ListEntity & { statuses?: { id: string; name: string }[] };
    const tasks = await this.tasksService.findAll(
      listId,
      undefined,
      true,
      undefined,
      SortDirection.ASC,
      undefined,
    );
    const statuses = await this.statusesService.findAll(listId);
    const statusMap = new Map(statuses.map((s) => [s.id, s.name]));
    const priorities = await this.priorityRepository.find({
      order: { orderIndex: 'ASC' },
    });
    const priorityMap = new Map(priorities.map((p) => [p.id, p.name]));

    const listPayload = {
      id: listData.id,
      name: listData.name,
      description: listData.description,
      isArchived: listData.isArchived,
      visibility: listData.visibility,
    };

    const tasksPayload = tasks.map((t) => {
      const task = t as TaskEntity & { status?: { id: string }; priority?: { id: string } };
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status ? statusMap.get(task.status.id) ?? null : null,
        priority: task.priority ? priorityMap.get(task.priority.id) ?? null : null,
        dueDate: task.dueDate
          ? (task.dueDate as Date).toISOString().slice(0, 10)
          : null,
        orderPosition: task.orderPosition,
        isArchived: task.isArchived,
        createdAt: (task.createdAt as Date)?.toISOString?.(),
        updatedAt: (task.updatedAt as Date)?.toISOString?.(),
      };
    });

    const baseName = sanitizeFilename(listData.name);
    const filenameJson = `${baseName}-tasks.json`;
    const filenameCsv = `${baseName}-tasks.csv`;

    if (format === 'json') {
      return {
        body: { list: listPayload, tasks: tasksPayload },
        contentType: 'application/json',
        filename: filenameJson,
      };
    }

    const rows = tasksPayload.map((t) => ({
      title: t.title ?? '',
      description: t.description ?? '',
      status: t.status ?? '',
      priority: t.priority ?? '',
      dueDate: t.dueDate ?? '',
      orderPosition: String(t.orderPosition ?? 0),
      isArchived: t.isArchived ? 'true' : 'false',
    }));
    const csv = Papa.unparse(rows, { columns: [...CSV_EXPORT_COLUMNS] });
    return {
      body: csv,
      contentType: 'text/csv',
      filename: filenameCsv,
    };
  }

  async importTasksFromCsv(
    listId: string,
    userId: string,
    csvContent: string,
  ): Promise<ImportTasksResult> {
    await this.ensureListAccess(listId, userId);
    const statuses = await this.statusesService.findAll(listId);
    const statusByName = new Map(
      statuses.map((s) => [s.name.trim().toLowerCase(), s]),
    );
    const priorities = await this.priorityRepository.find({
      order: { orderIndex: 'ASC' },
    });
    const priorityByName = new Map(
      priorities.map((p) => [p.name.trim().toLowerCase(), p]),
    );

    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    });

    const errors: { row: number; message: string }[] = [];
    let created = 0;

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNum = i + 2;
      const title = (row['title'] ?? '').trim();
      if (!title) {
        errors.push({ row: rowNum, message: 'Missing title' });
        continue;
      }

      const statusName = (row['status'] ?? '').trim();
      const priorityName = (row['priority'] ?? '').trim();
      let statusId: string | undefined;
      let priorityId: string | undefined;
      if (statusName) {
        const s = statusByName.get(statusName.toLowerCase());
        if (!s) {
          errors.push({
            row: rowNum,
            message: `Unknown status "${statusName}"`,
          });
          continue;
        }
        statusId = s.id;
      }
      if (priorityName) {
        const p = priorityByName.get(priorityName.toLowerCase());
        if (!p) {
          errors.push({
            row: rowNum,
            message: `Unknown priority "${priorityName}"`,
          });
          continue;
        }
        priorityId = p.id;
      }

      const dueDate = (
        row['duedate'] ??
        row['due date'] ??
        ''
      ).trim();
      const orderPosition = parseInt(
        (row['orderposition'] ?? row['order position'] ?? '0').trim(),
        10,
      );

      const dto: CreateTaskDto = {
        title,
        description: (row['description'] ?? '').trim() || undefined,
        listId,
        statusId,
        priorityId,
        dueDate: dueDate && /^\d{4}-\d{2}-\d{2}/.test(dueDate) ? dueDate : undefined,
        orderPosition: Number.isNaN(orderPosition) ? undefined : orderPosition,
      };

      try {
        await this.tasksService.create(dto, userId);
        created++;
      } catch (e) {
        errors.push({
          row: rowNum,
          message: e instanceof Error ? e.message : 'Create failed',
        });
      }
    }

    return {
      created,
      failed: errors.length,
      errors,
    };
  }

  async bulkCreate(
    userId: string,
    dto: BulkCreateTasksDto,
  ): Promise<BulkOperationResult> {
    await this.ensureListAccess(dto.listId, userId);
    const statuses = await this.statusesService.findAll(dto.listId);
    const statusByName = new Map(
      statuses.map((s) => [s.name.trim().toLowerCase(), s]),
    );
    const priorities = await this.priorityRepository.find({
      order: { orderIndex: 'ASC' },
    });
    const priorityByName = new Map(
      priorities.map((p) => [p.name.trim().toLowerCase(), p]),
    );

    const errors: { index: number; message: string }[] = [];
    let success = 0;

    for (let i = 0; i < dto.tasks.length; i++) {
      const item = dto.tasks[i] as BulkCreateTaskItemDto;
      let statusId: string | undefined;
      let priorityId: string | undefined;
      if (item.status) {
        const s = statusByName.get(item.status.trim().toLowerCase());
        if (!s) {
          errors.push({ index: i, message: `Unknown status "${item.status}"` });
          continue;
        }
        statusId = s.id;
      }
      if (item.priority) {
        const p = priorityByName.get(item.priority.trim().toLowerCase());
        if (!p) {
          errors.push({ index: i, message: `Unknown priority "${item.priority}"` });
          continue;
        }
        priorityId = p.id;
      }

      const createDto: CreateTaskDto = {
        title: item.title,
        description: item.description,
        listId: dto.listId,
        statusId,
        priorityId,
        dueDate: item.dueDate,
        orderPosition: item.orderPosition,
      };

      try {
        await this.tasksService.create(createDto, userId);
        success++;
      } catch (e) {
        errors.push({
          index: i,
          message: e instanceof Error ? e.message : 'Create failed',
        });
      }
    }

    return { success, failed: errors.length, errors };
  }

  async bulkUpdate(
    userId: string,
    dto: BulkUpdateTasksDto,
  ): Promise<BulkOperationResult> {
    if (dto.taskIds.length === 0) {
      return { success: 0, failed: 0 };
    }

    const tasks = await Promise.all(
      dto.taskIds.map((id) =>
        this.tasksService.findOne(id).catch(() => null),
      ),
    );
    const valid = tasks.filter((t): t is TaskEntity => t != null);
    const listIds = [...new Set(valid.map((t) => (t.list as { id: string }).id))];
    if (listIds.length > 1) {
      throw new BadRequestException(
        'All tasks must belong to the same list',
      );
    }
    const listId = listIds[0];
    if (!listId) {
      throw new NotFoundException('No valid tasks found');
    }
    await this.ensureListAccess(listId, userId);

    const updateDto: UpdateTaskDto = {};
    if (dto.statusId != null) updateDto.statusId = dto.statusId;
    if (dto.priorityId != null) updateDto.priorityId = dto.priorityId;
    if (dto.dueDate != null) updateDto.dueDate = dto.dueDate;

    const errors: { taskId: string; message: string }[] = [];
    let success = 0;
    for (const t of valid) {
      try {
        await this.tasksService.update(t.id, updateDto, userId);
        success++;
      } catch (e) {
        errors.push({
          taskId: t.id,
          message: e instanceof Error ? e.message : 'Update failed',
        });
      }
    }
    return { success, failed: errors.length, errors };
  }

  async bulkDelete(
    userId: string,
    dto: BulkDeleteTasksDto,
  ): Promise<BulkOperationResult> {
    const tasks = await Promise.all(
      dto.taskIds.map((id) =>
        this.tasksService.findOne(id).catch(() => null),
      ),
    );
    const valid = tasks.filter((t): t is TaskEntity => t != null);
    const listIds = [...new Set(valid.map((t) => (t.list as { id: string }).id))];
    if (listIds.length > 1) {
      throw new BadRequestException(
        'All tasks must belong to the same list',
      );
    }
    const listId = listIds[0];
    if (!listId) {
      throw new NotFoundException('No valid tasks found');
    }
    await this.ensureListAccess(listId, userId);

    const errors: { taskId: string; message: string }[] = [];
    let success = 0;
    for (const t of valid) {
      try {
        await this.tasksService.remove(t.id, userId);
        success++;
      } catch (e) {
        errors.push({
          taskId: t.id,
          message: e instanceof Error ? e.message : 'Delete failed',
        });
      }
    }
    return { success, failed: errors.length, errors };
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 80) || 'export';
}
