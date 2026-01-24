import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entities/comment.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ListEntity } from '../lists/entities/list.entity';
import { ListMemberEntity } from '../lists/entities/list-member.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { AttachmentsService } from '../attachments/attachments.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';
import { EventsEmitterService } from '../events/events-emitter.service';

const UUID_REGEX =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ListEntity)
    private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(ListMemberEntity)
    private readonly listMemberRepository: Repository<ListMemberEntity>,
    private readonly attachmentsService: AttachmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly eventsEmitter: EventsEmitterService,
  ) {}

  /**
   * Resolve mention strings (UUID or email) to user IDs
   */
  private async resolveMentionsToUserIds(mentions: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const m of mentions) {
      if (UUID_REGEX.test(m)) {
        ids.push(m);
      } else {
        const u = await this.userRepository.findOne({ where: { email: m } });
        if (u) ids.push(u.id);
      }
    }
    return [...new Set(ids)];
  }

  /**
   * Get attachments for a comment
   */
  private async getCommentAttachments(commentId: string) {
    try {
      return await this.attachmentsService.findAllByComment(commentId);
    } catch (error) {
      // If attachments service fails, return empty array
      return [];
    }
  }

  /**
   * Extract mentioned user IDs from comment content
   * Supports formats: @userId, @email
   */
  private extractMentions(content: string): string[] {
    const mentions: string[] = [];
    // Match @userId (UUID format) or @email patterns
    const userIdPattern = /@([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi;
    const emailPattern = /@([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;

    // Extract UUID mentions
    let match;
    while ((match = userIdPattern.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    // Extract email mentions (will need to resolve to userIds later)
    // For now, we'll just store the email pattern matches
    // In a production system, you'd want to resolve emails to user IDs
    while ((match = emailPattern.exec(content)) !== null) {
      // Store email, will be resolved in the response
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Check if user can edit/delete a comment
   * Returns true if user is comment author or list owner/editor
   */
  private async canUserModifyComment(
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user', 'task', 'task.list'],
    });

    if (!comment) {
      return false;
    }

    // Comment author can always modify
    if (comment.user.id === userId) {
      return true;
    }

    // Check if user is list owner/editor
    const list = comment.task.list;
    
    // Check workspace owner
    const listWithWorkspace = await this.listRepository.findOne({
      where: { id: list.id },
      relations: ['workspace', 'workspace.owner'],
    });

    if (listWithWorkspace?.workspace?.owner?.id === userId) {
      return true;
    }

    // Check list member role
    const member = await this.listMemberRepository.findOne({
      where: {
        list: { id: list.id },
        user: { id: userId },
      },
    });

    return member?.role === 'owner' || member?.role === 'editor';
  }

  /**
   * Create a comment on a task
   */
  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const { taskId, content } = createCommentDto;

    // Validate task exists
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['list'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create comment
    const comment = this.commentRepository.create({
      task: { id: taskId } as any,
      user: { id: userId } as any,
      content,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Reload with relations
    const commentWithRelations = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'task'],
    });

    if (!commentWithRelations) {
      throw new NotFoundException('Comment not found after creation');
    }

    // Extract mentions from content
    const mentions = this.extractMentions(content);
    // Get attachments for this comment
    const attachments = await this.getCommentAttachments(commentWithRelations.id);

    // Notify assignees and @mentioned users (exclude author)
    try {
      const taskWithAssignees = await this.taskRepository.findOne({
        where: { id: taskId },
        relations: ['assignments', 'assignments.user'],
      });
      const assigneeIds = (taskWithAssignees?.assignments ?? []).map(
        (a) => a.user.id,
      );
      const mentionIds = await this.resolveMentionsToUserIds(mentions);
      const toNotify = [...new Set([...assigneeIds, ...mentionIds])].filter(
        (id) => id !== userId,
      );
      const authorName = user.name || user.email;
      if (toNotify.length > 0) {
        await this.notificationsService.createForUsers(
          toNotify,
          NotificationType.COMMENT,
          'New comment',
          `${authorName} commented on task "${task.title}"`,
          savedComment.id,
        );
      }
    } catch {
      // Notification failure should not break comment creation
    }

    const payload = {
      id: commentWithRelations.id,
      taskId: commentWithRelations.task.id,
      userId: commentWithRelations.user.id,
      userEmail: commentWithRelations.user.email,
      userName: commentWithRelations.user.name,
      content: commentWithRelations.content,
      mentions,
      attachments,
      createdAt: commentWithRelations.createdAt,
      updatedAt: commentWithRelations.updatedAt,
    };

    try {
      this.eventsEmitter.emitCommentCreated(
        task.list.id,
        commentWithRelations.task.id,
        { ...payload, createdAt: (payload.createdAt as Date).toISOString(), updatedAt: (payload.updatedAt as Date).toISOString() },
      );
    } catch {
      // Real-time emit must not break create
    }

    return payload;
  }

  /**
   * Get all comments for a task
   */
  async findAllByTask(taskId: string): Promise<CommentResponseDto[]> {
    // Validate task exists
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comments = await this.commentRepository.find({
      where: {
        task: { id: taskId },
      },
      relations: ['user', 'task'],
      order: { createdAt: 'ASC' },
    });

    // Fetch attachments for all comments in parallel
    const commentsWithAttachments = await Promise.all(
      comments.map(async (comment) => {
        const attachments = await this.getCommentAttachments(comment.id);
        return {
          id: comment.id,
          taskId: comment.task.id,
          userId: comment.user.id,
          userEmail: comment.user.email,
          userName: comment.user.name,
          content: comment.content,
          mentions: this.extractMentions(comment.content),
          attachments,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      }),
    );

    return commentsWithAttachments;
  }

  /**
   * Get a single comment
   */
  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const attachments = await this.getCommentAttachments(comment.id);

    return {
      id: comment.id,
      taskId: comment.task.id,
      userId: comment.user.id,
      userEmail: comment.user.email,
      userName: comment.user.name,
      content: comment.content,
      mentions: this.extractMentions(comment.content),
      attachments,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  /**
   * Update a comment
   */
  async update(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    // Check permission
    const canModify = await this.canUserModifyComment(id, userId);
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to edit this comment',
      );
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'task', 'task.list'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }

    await this.commentRepository.save(comment);

    // Reload with relations
    const updatedComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'task', 'task.list'],
    });

    if (!updatedComment) {
      throw new NotFoundException('Comment not found after update');
    }

    const attachments = await this.getCommentAttachments(updatedComment.id);

    const payload = {
      id: updatedComment.id,
      taskId: updatedComment.task.id,
      userId: updatedComment.user.id,
      userEmail: updatedComment.user.email,
      userName: updatedComment.user.name,
      content: updatedComment.content,
      mentions: this.extractMentions(updatedComment.content),
      attachments,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
    };

    try {
      const taskWithList = updatedComment.task as TaskEntity & { list?: { id: string } };
      const listId = taskWithList.list?.id;
      if (listId) {
        this.eventsEmitter.emitCommentUpdated(listId, updatedComment.task.id, {
          ...payload,
          createdAt: (payload.createdAt as Date).toISOString(),
          updatedAt: (payload.updatedAt as Date).toISOString(),
        });
      }
    } catch {
      // Real-time emit must not break update
    }

    return payload;
  }

  /**
   * Delete a comment
   */
  async remove(id: string, userId: string): Promise<void> {
    // Check permission
    const canModify = await this.canUserModifyComment(id, userId);
    if (!canModify) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['task', 'task.list'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const listId = (comment.task as TaskEntity & { list?: { id: string } }).list?.id;
    const taskId = comment.task.id;

    await this.commentRepository.remove(comment);

    try {
      if (listId) {
        this.eventsEmitter.emitCommentDeleted(listId, taskId, id);
      }
    } catch {
      // Real-time emit must not break delete
    }
  }
}
