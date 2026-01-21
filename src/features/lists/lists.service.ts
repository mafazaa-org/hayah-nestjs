import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ListEntity } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { DuplicateListDto } from './dto/duplicate-list.dto';
import { StatusEntity } from '../statuses/entities/status.entity';
import { ListTemplateEntity } from './entities/list-template.entity';
import { CreateListTemplateDto } from './dto/create-list-template.dto';
import { CreateListFromTemplateDto } from './dto/create-list-from-template.dto';
import { CustomFieldEntity } from './entities/custom-field.entity';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { FilterPresetEntity } from './entities/filter-preset.entity';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';
import { UpdateFilterPresetDto } from './dto/update-filter-preset.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
    @InjectRepository(ListTemplateEntity)
    private readonly listTemplateRepository: Repository<ListTemplateEntity>,
    @InjectRepository(CustomFieldEntity)
    private readonly customFieldRepository: Repository<CustomFieldEntity>,
    @InjectRepository(FilterPresetEntity)
    private readonly filterPresetRepository: Repository<FilterPresetEntity>,
  ) {}

  async create(createListDto: CreateListDto): Promise<ListEntity> {
    const {
      name,
      description,
      workspaceId,
      folderId,
      visibility,
      defaultViewConfig,
    } = createListDto;

    const list = this.listRepository.create({
      name,
      description: description || null,
      workspace: { id: workspaceId } as any,
      folder: folderId ? ({ id: folderId } as any) : null,
      visibility: visibility || 'private',
      defaultViewConfig: defaultViewConfig || null,
      isArchived: false,
    });

    const savedList = await this.listRepository.save(list);

    // Create default statuses for the new list
    await this.createDefaultStatuses(savedList.id);

    // Reload with relationships
    return this.findOne(savedList.id);
  }

  async findAll(
    workspaceId?: string,
    folderId?: string | null,
  ): Promise<ListEntity[]> {
    const where: any = {};

    if (workspaceId) {
      where.workspace = { id: workspaceId };
    }

    if (folderId !== undefined) {
      if (folderId === null || folderId === 'null') {
        // Explicitly filter for lists without a folder (root lists)
        where.folder = IsNull();
      } else {
        where.folder = { id: folderId };
      }
    }

    return this.listRepository.find({
      where,
      relations: ['folder', 'workspace'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ListEntity> {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: ['folder', 'workspace', 'statuses'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<ListEntity> {
    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    if (updateListDto.name !== undefined) {
      list.name = updateListDto.name;
    }

    if (updateListDto.description !== undefined) {
      list.description = updateListDto.description || null;
    }

    if (updateListDto.visibility !== undefined) {
      list.visibility = updateListDto.visibility;
    }

    if (updateListDto.defaultViewConfig !== undefined) {
      list.defaultViewConfig = updateListDto.defaultViewConfig || null;
    }

    return this.listRepository.save(list);
  }

  async remove(id: string): Promise<void> {
    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Cascade delete will handle related entities (statuses, tasks, etc.)
    await this.listRepository.remove(list);
  }

  async archive(id: string): Promise<ListEntity> {
    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    if (list.isArchived) {
      throw new BadRequestException('List is already archived');
    }

    list.isArchived = true;
    return this.listRepository.save(list);
  }

  async unarchive(id: string): Promise<ListEntity> {
    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    if (!list.isArchived) {
      throw new BadRequestException('List is not archived');
    }

    list.isArchived = false;
    return this.listRepository.save(list);
  }

  async duplicate(
    id: string,
    duplicateListDto: DuplicateListDto,
  ): Promise<ListEntity> {
    const originalList = await this.listRepository.findOne({
      where: { id },
      relations: [
        'statuses',
        'tasks',
        'customFields',
        'folder',
        'workspace',
      ],
    });

    if (!originalList) {
      throw new NotFoundException('List not found');
    }

    // Create new list with copied properties
    const newList = this.listRepository.create({
      name: `${originalList.name} (Copy)`,
      description: originalList.description,
      workspace: originalList.workspace,
      folder: originalList.folder,
      visibility: originalList.visibility,
      defaultViewConfig: originalList.defaultViewConfig
        ? { ...originalList.defaultViewConfig }
        : null,
      isArchived: false,
    });

    const savedList = await this.listRepository.save(newList);

    // Copy statuses
    if (originalList.statuses && originalList.statuses.length > 0) {
      const statusPromises = originalList.statuses.map((status) => {
        const newStatus = this.statusRepository.create({
          name: status.name,
          orderIndex: status.orderIndex,
          list: savedList,
        });
        return this.statusRepository.save(newStatus);
      });
      await Promise.all(statusPromises);
    } else {
      // Create default statuses if original had none
      await this.createDefaultStatuses(savedList.id);
    }

    // Optionally copy tasks
    const includeTasks = duplicateListDto.includeTasks ?? false;
    if (includeTasks && originalList.tasks && originalList.tasks.length > 0) {
      // Task duplication will be handled in Phase 8 (Tasks Module)
      // For now, we just note that tasks exist but don't duplicate them yet
      // This can be implemented when TaskService is available
    }

    // Copy custom fields (if any exist in the original list)
    if (
      originalList.customFields &&
      originalList.customFields.length > 0
    ) {
      // Custom field duplication can be implemented when CustomFieldService is available
      // For now, we skip this as it's not part of Phase 7 core requirements
    }

    // Reload with relationships
    return this.findOne(savedList.id);
  }

  /**
   * Creates default statuses for a new list (Todo, Doing, Done)
   */
  private async createDefaultStatuses(listId: string): Promise<void> {
    const defaultStatuses = [
      { name: 'Todo', orderIndex: 0 },
      { name: 'Doing', orderIndex: 1 },
      { name: 'Done', orderIndex: 2 },
    ];

    const statusPromises = defaultStatuses.map((status) => {
      const statusEntity = this.statusRepository.create({
        name: status.name,
        orderIndex: status.orderIndex,
        list: { id: listId } as any,
      });
      return this.statusRepository.save(statusEntity);
    });

    await Promise.all(statusPromises);
  }

  /**
   * Template Management Methods
   */

  async createTemplate(
    userId: string,
    createTemplateDto: CreateListTemplateDto,
  ): Promise<ListTemplateEntity> {
    const { name, description, isPublic, workspaceId, templateConfig } =
      createTemplateDto;

    const template = this.listTemplateRepository.create({
      name,
      description: description || null,
      isPublic: isPublic ?? false,
      templateConfig,
      user: { id: userId } as any,
      workspace: workspaceId ? ({ id: workspaceId } as any) : null,
    });

    return this.listTemplateRepository.save(template);
  }

  async findAllTemplates(
    userId?: string,
    workspaceId?: string,
    includePublic: boolean = true,
  ): Promise<ListTemplateEntity[]> {
    const where: any = {};

    if (userId) {
      where.user = { id: userId };
    }

    if (workspaceId) {
      where.workspace = { id: workspaceId };
    }

    const templates = await this.listTemplateRepository.find({
      where,
      relations: ['user', 'workspace'],
      order: { createdAt: 'DESC' },
    });

    // Filter public templates if requested
    if (includePublic && userId) {
      const publicTemplates = await this.listTemplateRepository.find({
        where: { isPublic: true },
        relations: ['user', 'workspace'],
        order: { createdAt: 'DESC' },
      });

      // Merge and deduplicate
      const templateMap = new Map<string, ListTemplateEntity>();
      templates.forEach((t) => templateMap.set(t.id, t));
      publicTemplates.forEach((t) => {
        if (!templateMap.has(t.id)) {
          templateMap.set(t.id, t);
        }
      });

      return Array.from(templateMap.values());
    }

    return templates;
  }

  async findTemplate(id: string): Promise<ListTemplateEntity> {
    const template = await this.listTemplateRepository.findOne({
      where: { id },
      relations: ['user', 'workspace'],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async createFromTemplate(
    templateId: string,
    createFromTemplateDto: CreateListFromTemplateDto,
  ): Promise<ListEntity> {
    const template = await this.findTemplate(templateId);

    // Check if template is public or user has access
    if (!template.isPublic) {
      // Additional access control can be added here
      // For now, we allow creation from any template
    }

    const { name, description, workspaceId, folderId } = createFromTemplateDto;
    const { templateConfig } = template;

    // Create the list
    const list = this.listRepository.create({
      name,
      description: description || null,
      workspace: { id: workspaceId } as any,
      folder: folderId ? ({ id: folderId } as any) : null,
      visibility: templateConfig.visibility || 'private',
      defaultViewConfig: templateConfig.defaultViewConfig || null,
      isArchived: false,
    });

    const savedList = await this.listRepository.save(list);

    // Create statuses from template
    if (templateConfig.statuses && templateConfig.statuses.length > 0) {
      const statusPromises = templateConfig.statuses.map((statusConfig) => {
        const statusEntity = this.statusRepository.create({
          name: statusConfig.name,
          orderIndex: statusConfig.orderIndex,
          list: savedList,
        });
        return this.statusRepository.save(statusEntity);
      });
      await Promise.all(statusPromises);
    } else {
      // Fallback to default statuses if template has none
      await this.createDefaultStatuses(savedList.id);
    }

    // Create custom fields from template
    if (
      templateConfig.customFields &&
      templateConfig.customFields.length > 0
    ) {
      const customFieldPromises = templateConfig.customFields.map(
        (fieldConfig) => {
          const customFieldEntity = this.customFieldRepository.create({
            name: fieldConfig.name,
            type: fieldConfig.type as 'text' | 'number' | 'date' | 'dropdown',
            config: fieldConfig.config || null,
            list: savedList,
          } as any);
          return this.customFieldRepository.save(customFieldEntity);
        },
      );
      await Promise.all(customFieldPromises);
    }

    // Reload with relationships
    return this.findOne(savedList.id);
  }

  // Custom Field methods
  async createCustomField(
    createCustomFieldDto: CreateCustomFieldDto,
  ): Promise<CustomFieldEntity> {
    const { name, type, listId, config } = createCustomFieldDto;

    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const customField = this.customFieldRepository.create({
      name,
      type,
      config: config || null,
      list: { id: listId } as any,
    });

    return this.customFieldRepository.save(customField);
  }

  async findAllCustomFields(listId: string): Promise<CustomFieldEntity[]> {
    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    return this.customFieldRepository.find({
      where: { list: { id: listId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOneCustomField(id: string): Promise<CustomFieldEntity> {
    const customField = await this.customFieldRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    return customField;
  }

  async updateCustomField(
    id: string,
    updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomFieldEntity> {
    const customField = await this.customFieldRepository.findOne({
      where: { id },
    });

    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    Object.assign(customField, updateCustomFieldDto);

    return this.customFieldRepository.save(customField);
  }

  async removeCustomField(id: string): Promise<void> {
    const customField = await this.customFieldRepository.findOne({
      where: { id },
    });

    if (!customField) {
      throw new NotFoundException('Custom field not found');
    }

    await this.customFieldRepository.remove(customField);
  }

  // Filter Preset methods
  async createFilterPreset(
    userId: string,
    createFilterPresetDto: CreateFilterPresetDto,
  ): Promise<FilterPresetEntity> {
    const { name, listId, filterConfig, includeArchived } = createFilterPresetDto;

    // Verify list exists
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Store filterConfig as JSON along with includeArchived
    const presetConfig = {
      filters: filterConfig,
      includeArchived: includeArchived ?? false,
    };

    const filterPreset = this.filterPresetRepository.create({
      name,
      filterConfig: presetConfig,
      user: { id: userId } as any,
      list: { id: listId } as any,
    });

    return this.filterPresetRepository.save(filterPreset);
  }

  async findAllFilterPresets(
    userId: string,
    listId?: string,
  ): Promise<FilterPresetEntity[]> {
    const where: any = { user: { id: userId } };
    if (listId) {
      where.list = { id: listId };
    }

    return this.filterPresetRepository.find({
      where,
      relations: ['list'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneFilterPreset(id: string, userId: string): Promise<FilterPresetEntity> {
    const filterPreset = await this.filterPresetRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['list', 'user'],
    });

    if (!filterPreset) {
      throw new NotFoundException('Filter preset not found');
    }

    return filterPreset;
  }

  async updateFilterPreset(
    id: string,
    userId: string,
    updateFilterPresetDto: UpdateFilterPresetDto,
  ): Promise<FilterPresetEntity> {
    const filterPreset = await this.filterPresetRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!filterPreset) {
      throw new NotFoundException('Filter preset not found');
    }

    // Update filter config if provided
    if (updateFilterPresetDto.filterConfig !== undefined || updateFilterPresetDto.includeArchived !== undefined) {
      const currentConfig = filterPreset.filterConfig as any;
      const updatedConfig = {
        filters: updateFilterPresetDto.filterConfig ?? currentConfig.filters,
        includeArchived: updateFilterPresetDto.includeArchived ?? currentConfig.includeArchived ?? false,
      };
      filterPreset.filterConfig = updatedConfig;
    }

    if (updateFilterPresetDto.name !== undefined) {
      filterPreset.name = updateFilterPresetDto.name;
    }

    return this.filterPresetRepository.save(filterPreset);
  }

  async removeFilterPreset(id: string, userId: string): Promise<void> {
    const filterPreset = await this.filterPresetRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!filterPreset) {
      throw new NotFoundException('Filter preset not found');
    }

    await this.filterPresetRepository.remove(filterPreset);
  }
}