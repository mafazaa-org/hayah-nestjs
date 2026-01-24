import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { ViewEntity } from './entities/view.entity';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';
import { UpdateFilterPresetDto } from './dto/update-filter-preset.dto';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { ListMemberEntity } from './entities/list-member.entity';
import { UserEntity } from '../users/entities/user.entity';
import { InviteUserToListDto } from './dto/invite-user-to-list.dto';
import { UpdateListMemberRoleDto } from './dto/update-list-member-role.dto';
import { ListMemberResponseDto } from './dto/list-member-response.dto';
import { ListPermissionsResponseDto } from './dto/list-permissions-response.dto';
import { TasksService } from '../tasks/tasks.service';
import { FilterTasksDto } from '../tasks/dto/filter-tasks.dto';
import { SortDirection } from '../tasks/dto/sort-tasks.dto';
import { TaskEntity } from '../tasks/entities/task.entity';

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
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ListMemberEntity)
    private readonly listMemberRepository: Repository<ListMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tasksService: TasksService,
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

  // View methods (Multiple Board Views)
  async createView(
    userId: string,
    createViewDto: CreateViewDto,
  ): Promise<ViewEntity> {
    const { name, listId, type, config } = createViewDto;

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    const view = this.viewRepository.create({
      name,
      type,
      config: config ?? null,
      list: { id: listId } as ListEntity,
      user: { id: userId } as UserEntity,
    });
    return this.viewRepository.save(view);
  }

  async findAllViews(userId: string, listId?: string): Promise<ViewEntity[]> {
    const where: any = { user: { id: userId } };
    if (listId) {
      where.list = { id: listId };
    }
    return this.viewRepository.find({
      where,
      relations: ['list', 'user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOneView(id: string, userId: string): Promise<ViewEntity> {
    const view = await this.viewRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['list', 'user'],
    });
    if (!view) {
      throw new NotFoundException('View not found');
    }
    return view;
  }

  async updateView(
    id: string,
    userId: string,
    updateViewDto: UpdateViewDto,
  ): Promise<ViewEntity> {
    const view = await this.viewRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!view) {
      throw new NotFoundException('View not found');
    }
    if (updateViewDto.name !== undefined) view.name = updateViewDto.name;
    if (updateViewDto.type !== undefined) view.type = updateViewDto.type;
    if (updateViewDto.config !== undefined) view.config = updateViewDto.config;
    return this.viewRepository.save(view);
  }

  async removeView(id: string, userId: string): Promise<void> {
    const view = await this.viewRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!view) {
      throw new NotFoundException('View not found');
    }
    await this.viewRepository.remove(view);
  }

  /**
   * Get tasks filtered and sorted by a view's config. Uses view's listId, filters, sort, includeArchived.
   */
  async getTasksForView(viewId: string, userId: string): Promise<TaskEntity[]> {
    const view = await this.findOneView(viewId, userId);
    const list = view.list as ListEntity;
    const listId = list?.id;
    if (!listId) {
      throw new BadRequestException('View list not found');
    }
    const cfg = view.config ?? {};
    const filterDto: FilterTasksDto = {
      listId,
      filters: cfg.filters ?? undefined,
      includeArchived: cfg.includeArchived ?? false,
    };
    return this.tasksService.filterTasks(
      filterDto,
      cfg.sortField,
      (cfg.sortDirection as SortDirection) ?? SortDirection.ASC,
      cfg.customFieldId,
    );
  }

  // List Member (Sharing/Teams) Methods

  /**
   * Get user's role in a list
   * Returns 'owner' | 'editor' | 'viewer' | null
   */
  async getUserListRole(
    listId: string,
    userId: string,
  ): Promise<'owner' | 'editor' | 'viewer' | null> {
    const listMember = await this.listMemberRepository.findOne({
      where: {
        list: { id: listId },
        user: { id: userId },
      },
    });

    return listMember ? listMember.role : null;
  }

  /**
   * Check if user has permission to view/edit/delete a list
   */
  async checkUserPermission(
    listId: string,
    userId: string,
  ): Promise<ListPermissionsResponseDto> {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['workspace', 'workspace.owner'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Check if user is workspace owner (owner has full access to all lists)
    const isWorkspaceOwner = list.workspace.owner.id === userId;

    // Get user's role in the list
    const role = await this.getUserListRole(listId, userId);

    // Owner of workspace has full access
    if (isWorkspaceOwner) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        role: 'owner',
      };
    }

    // Check permissions based on role
    switch (role) {
      case 'owner':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          role: 'owner',
        };
      case 'editor':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          role: 'editor',
        };
      case 'viewer':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          role: 'viewer',
        };
      default:
        // No role - check if list is private
        // Private lists are only accessible to workspace owner
        // Shared lists might be accessible to all (if visibility is 'shared')
        // For now, we'll require explicit membership
        return {
          canView: false,
          canEdit: false,
          canDelete: false,
          role: null,
        };
    }
  }

  /**
   * Invite user to list via email
   */
  async inviteUserToList(
    listId: string,
    inviterUserId: string,
    inviteUserToListDto: InviteUserToListDto,
  ): Promise<ListMemberEntity> {
    const { email, role } = inviteUserToListDto;

    // Check if inviter has permission to invite (must be owner or editor)
    const inviterPermission = await this.checkUserPermission(
      listId,
      inviterUserId,
    );
    if (!inviterPermission.canEdit) {
      throw new ForbiddenException(
        'You do not have permission to invite users to this list',
      );
    }

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    // Check if user is already a member
    const existingMember = await this.listMemberRepository.findOne({
      where: {
        list: { id: listId },
        user: { id: user.id },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this list');
    }

    // Validate list exists
    const list = await this.listRepository.findOne({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Create list member
    const listMember = this.listMemberRepository.create({
      list: { id: listId } as any,
      user: { id: user.id } as any,
      role,
    });

    return this.listMemberRepository.save(listMember);
  }

  /**
   * Get all members of a list
   */
  async findAllListMembers(listId: string): Promise<ListMemberResponseDto[]> {
    // Validate list exists
    const list = await this.listRepository.findOne({
      where: { id: listId },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const members = await this.listMemberRepository.find({
      where: {
        list: { id: listId },
      },
      relations: ['user', 'list'],
      order: { createdAt: 'ASC' },
    });

    return members.map((member) => ({
      id: member.id,
      userId: member.user.id,
      userEmail: member.user.email,
      userName: member.user.name,
      listId: member.list.id,
      role: member.role,
      createdAt: member.createdAt,
    }));
  }

  /**
   * Get single list member
   */
  async findOneListMember(id: string): Promise<ListMemberResponseDto> {
    const member = await this.listMemberRepository.findOne({
      where: { id },
      relations: ['user', 'list'],
    });

    if (!member) {
      throw new NotFoundException('List member not found');
    }

    return {
      id: member.id,
      userId: member.user.id,
      userEmail: member.user.email,
      userName: member.user.name,
      listId: member.list.id,
      role: member.role,
      createdAt: member.createdAt,
    };
  }

  /**
   * Update list member role
   */
  async updateListMemberRole(
    id: string,
    updaterUserId: string,
    updateListMemberRoleDto: UpdateListMemberRoleDto,
  ): Promise<ListMemberEntity> {
    const { role } = updateListMemberRoleDto;

    // Find member
    const member = await this.listMemberRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!member) {
      throw new NotFoundException('List member not found');
    }

    // Check if updater has permission (must be owner or editor, and can only change role to viewer/editor, not owner)
    const updaterPermission = await this.checkUserPermission(
      member.list.id,
      updaterUserId,
    );
    if (!updaterPermission.canEdit) {
      throw new ForbiddenException(
        'You do not have permission to update member roles',
      );
    }

    // Only owners can assign owner role
    if (role === 'owner' && updaterPermission.role !== 'owner') {
      throw new ForbiddenException(
        'Only owners can assign the owner role',
      );
    }

    // Cannot change own role if you're the only owner
    if (member.user.id === updaterUserId && member.role === 'owner') {
      // Check if there are other owners
      const ownerCount = await this.listMemberRepository.count({
        where: {
          list: { id: member.list.id },
          role: 'owner',
        },
      });

      if (ownerCount === 1 && role !== 'owner') {
        throw new BadRequestException(
          'Cannot change role: you are the only owner of this list',
        );
      }
    }

    member.role = role;
    return this.listMemberRepository.save(member);
  }

  /**
   * Remove user from list
   */
  async removeListMember(
    id: string,
    removerUserId: string,
  ): Promise<void> {
    // Find member
    const member = await this.listMemberRepository.findOne({
      where: { id },
      relations: ['list', 'user'],
    });

    if (!member) {
      throw new NotFoundException('List member not found');
    }

    // Check if remover has permission
    const removerPermission = await this.checkUserPermission(
      member.list.id,
      removerUserId,
    );
    if (!removerPermission.canEdit) {
      throw new ForbiddenException(
        'You do not have permission to remove members from this list',
      );
    }

    // Cannot remove the last owner
    if (member.role === 'owner') {
      const ownerCount = await this.listMemberRepository.count({
        where: {
          list: { id: member.list.id },
          role: 'owner',
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException(
          'Cannot remove the last owner of the list',
        );
      }
    }

    // Cannot remove yourself if you're the only owner
    if (member.user.id === removerUserId && member.role === 'owner') {
      const ownerCount = await this.listMemberRepository.count({
        where: {
          list: { id: member.list.id },
          role: 'owner',
        },
      });

      if (ownerCount === 1) {
        throw new BadRequestException(
          'Cannot remove yourself: you are the only owner of this list',
        );
      }
    }

    await this.listMemberRepository.remove(member);
  }
}