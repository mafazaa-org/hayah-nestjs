import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TaskEntity } from '../tasks/entities/task.entity';
import { ListEntity } from '../lists/entities/list.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { SearchHistoryEntity } from './entities/search-history.entity';
import { GlobalSearchDto } from './dto/global-search.dto';
import { GlobalSearchResultDto } from './dto/global-search-result.dto';
import { ListsService } from '../lists/lists.service';
import { UserEntity } from '../users/entities/user.entity';
import { ListMemberEntity } from '../lists/entities/list-member.entity';
import { WorkspaceEntity } from '../workspaces/entities/workspace.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(SearchHistoryEntity)
    private readonly searchHistoryRepository: Repository<SearchHistoryEntity>,
    @InjectRepository(ListMemberEntity)
    private readonly listMemberRepository: Repository<ListMemberEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly listsService: ListsService,
  ) {}

  /**
   * Get all list IDs that the user has access to
   */
  private async getAccessibleListIds(userId: string): Promise<string[]> {
    const accessibleListIds: Set<string> = new Set();

    // Get all lists from workspaces where user is owner
    const ownedWorkspaceLists = await this.listRepository
      .createQueryBuilder('list')
      .innerJoin('list.workspace', 'workspace')
      .where('workspace.owner.id = :userId', { userId })
      .select('list.id', 'id')
      .getRawMany();

    for (const row of ownedWorkspaceLists) {
      accessibleListIds.add(row.id);
    }

    // Get all lists where user is a member
    const memberLists = await this.listMemberRepository
      .createQueryBuilder('listMember')
      .innerJoin('listMember.list', 'list')
      .where('listMember.user.id = :userId', { userId })
      .select('list.id', 'id')
      .getRawMany();

    for (const row of memberLists) {
      accessibleListIds.add(row.id);
    }

    return Array.from(accessibleListIds);
  }

  /**
   * Global search across all accessible lists and tasks
   */
  async globalSearch(
    userId: string,
    searchDto: GlobalSearchDto,
  ): Promise<GlobalSearchResultDto> {
    const { query, assigneeId, statusId, dateFrom, dateTo, workspaceId, listId } =
      searchDto;

    // Get accessible list IDs
    let accessibleListIds = await this.getAccessibleListIds(userId);

    // Filter by workspace if provided
    if (workspaceId) {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
        relations: ['lists'],
      });

      if (workspace && workspace.lists) {
        const workspaceListIds = workspace.lists.map((l) => l.id);
        accessibleListIds = accessibleListIds.filter((id) =>
          workspaceListIds.includes(id),
        );
      } else {
        accessibleListIds = [];
      }
    }

    // Filter by specific list if provided
    if (listId) {
      if (accessibleListIds.includes(listId)) {
        accessibleListIds = [listId];
      } else {
        // User doesn't have access to this list
        accessibleListIds = [];
      }
    }

    if (accessibleListIds.length === 0) {
      // No accessible lists, return empty results
      return {
        tasks: [],
        lists: [],
        totalTasks: 0,
        totalLists: 0,
        query,
      };
    }

    // Build task search query
    const taskQueryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.list', 'list')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.priority', 'priority')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .leftJoinAndSelect('assignments.user', 'assignee')
      .leftJoinAndSelect('task.taskTags', 'taskTags')
      .leftJoinAndSelect('taskTags.tag', 'tag')
      .where('task.list.id IN (:...listIds)', { listIds: accessibleListIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false });

    // Search in title, description, and comments
    const searchPattern = `%${query}%`;
    taskQueryBuilder.andWhere(
      `(
        LOWER(task.title) LIKE LOWER(:query) OR 
        LOWER(task.description) LIKE LOWER(:query) OR
        EXISTS (
          SELECT 1 FROM comments c 
          WHERE c.task_id = task.id 
          AND LOWER(c.content) LIKE LOWER(:query)
        )
      )`,
      { query: searchPattern },
    );

    // Apply filters
    if (assigneeId) {
      taskQueryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM assignments a WHERE a.task_id = task.id AND a.user_id = :assigneeId)',
        { assigneeId },
      );
    }

    if (statusId) {
      taskQueryBuilder.andWhere('task.status.id = :statusId', { statusId });
    }

    if (dateFrom) {
      taskQueryBuilder.andWhere('task.dueDate >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      taskQueryBuilder.andWhere('task.dueDate <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    // Execute task query
    const tasks = await taskQueryBuilder
      .orderBy('task.createdAt', 'DESC')
      .getMany();

    // Search lists by name and description
    const listQueryBuilder = this.listRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.workspace', 'workspace')
      .leftJoinAndSelect('list.folder', 'folder')
      .where('list.id IN (:...listIds)', { listIds: accessibleListIds })
      .andWhere('list.isArchived = :isArchived', { isArchived: false })
      .andWhere(
        '(LOWER(list.name) LIKE LOWER(:query) OR LOWER(list.description) LIKE LOWER(:query))',
        { query: searchPattern },
      );

    if (workspaceId) {
      listQueryBuilder.andWhere('list.workspace.id = :workspaceId', {
        workspaceId,
      });
    }

    const lists = await listQueryBuilder
      .orderBy('list.createdAt', 'DESC')
      .getMany();

    // Save search history
    await this.saveSearchHistory(userId, searchDto);

    return {
      tasks,
      lists,
      totalTasks: tasks.length,
      totalLists: lists.length,
      query,
    };
  }

  /**
   * Save search history
   */
  private async saveSearchHistory(
    userId: string,
    searchDto: GlobalSearchDto,
  ): Promise<void> {
    const filters: SearchHistoryEntity['filters'] = {};

    if (searchDto.assigneeId) filters.assigneeId = searchDto.assigneeId;
    if (searchDto.statusId) filters.statusId = searchDto.statusId;
    if (searchDto.dateFrom) filters.dateFrom = searchDto.dateFrom;
    if (searchDto.dateTo) filters.dateTo = searchDto.dateTo;
    if (searchDto.workspaceId) filters.workspaceId = searchDto.workspaceId;
    if (searchDto.listId) filters.listId = searchDto.listId;

    const searchHistory = this.searchHistoryRepository.create({
      query: searchDto.query,
      filters: Object.keys(filters).length > 0 ? filters : null,
      user: { id: userId } as any,
    });

    await this.searchHistoryRepository.save(searchHistory);

    // Keep only last 50 searches per user
    const userSearches = await this.searchHistoryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (userSearches.length > 50) {
      const toDelete = userSearches.slice(50);
      await this.searchHistoryRepository.remove(toDelete);
    }
  }

  /**
   * Get recent searches for a user
   */
  async getRecentSearches(
    userId: string,
    limit: number = 10,
  ): Promise<SearchHistoryEntity[]> {
    return this.searchHistoryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Clear search history for a user
   */
  async clearSearchHistory(userId: string): Promise<void> {
    const searches = await this.searchHistoryRepository.find({
      where: { user: { id: userId } },
    });
    await this.searchHistoryRepository.remove(searches);
  }
}
