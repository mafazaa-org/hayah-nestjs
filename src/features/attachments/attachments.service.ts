import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentEntity } from './entities/attachment.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CommentEntity } from '../comments/entities/comment.entity';
import { AttachmentResponseDto } from './dto/attachment-response.dto';
import { ActivitiesService } from '../tasks/services/activities.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

@Injectable()
export class AttachmentsService {
  private readonly uploadPath: string;

  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepository: Repository<AttachmentEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @Inject(forwardRef(() => ActivitiesService))
    private readonly activitiesService: ActivitiesService,
  ) {
    // Set upload directory (can be configured via environment variable)
    this.uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectoryExists();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Validate file
   */
  private validateFile(file: { size: number; mimetype?: string }): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${randomUUID()}_${sanitizedBaseName}${ext}`;
  }

  /**
   * Upload file to task
   */
  async uploadFile(
    taskId: string,
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype?: string; size: number },
  ): Promise<AttachmentResponseDto> {
    // Validate task exists
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
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

    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadPath, uniqueFilename);

    // Save file to disk
    try {
      await fs.writeFile(filePath, file.buffer);
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }

    // Create attachment record
    const attachment = this.attachmentRepository.create({
      task: { id: taskId } as any,
      user: { id: userId } as any,
      filename: file.originalname,
      url: `/attachments/${uniqueFilename}`, // Relative URL for serving files
      mimeType: file.mimetype || null,
      size: file.size,
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);

    // Reload with relations
    const attachmentWithRelations = await this.attachmentRepository.findOne({
      where: { id: savedAttachment.id },
      relations: ['user', 'task', 'comment'],
    });

    if (!attachmentWithRelations) {
      throw new NotFoundException('Attachment not found after creation');
    }

    // Track activity
    try {
      await this.activitiesService.createActivity(
        taskId,
        userId,
        'task_attachment_uploaded',
        null,
        {
          attachmentId: attachmentWithRelations.id,
          filename: attachmentWithRelations.filename,
          size: attachmentWithRelations.size,
        },
      );
    } catch (error) {
      // Activity tracking failure shouldn't break the upload
      // Log error if needed
    }

    return {
      id: attachmentWithRelations.id,
      taskId: attachmentWithRelations.task?.id || null,
      commentId: attachmentWithRelations.comment?.id || null,
      userId: attachmentWithRelations.user.id,
      userEmail: attachmentWithRelations.user.email,
      userName: attachmentWithRelations.user.name,
      filename: attachmentWithRelations.filename,
      url: attachmentWithRelations.url,
      mimeType: attachmentWithRelations.mimeType,
      size: attachmentWithRelations.size,
      createdAt: attachmentWithRelations.createdAt,
      updatedAt: attachmentWithRelations.updatedAt,
    };
  }

  /**
   * Get all attachments for a task
   */
  async findAllByTask(taskId: string): Promise<AttachmentResponseDto[]> {
    // Validate task exists
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const attachments = await this.attachmentRepository.find({
      where: {
        task: { id: taskId },
      },
      relations: ['user', 'task', 'comment'],
      order: { createdAt: 'DESC' },
    });

    return attachments.map((attachment) => ({
      id: attachment.id,
      taskId: attachment.task?.id || null,
      commentId: attachment.comment?.id || null,
      userId: attachment.user.id,
      userEmail: attachment.user.email,
      userName: attachment.user.name,
      filename: attachment.filename,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    }));
  }

  /**
   * Upload file to comment
   */
  async uploadFileToComment(
    commentId: string,
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype?: string; size: number },
  ): Promise<AttachmentResponseDto> {
    // Validate comment exists
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadPath, uniqueFilename);

    // Save file to disk
    try {
      await fs.writeFile(filePath, file.buffer);
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }

    // Create attachment record
    const attachment = this.attachmentRepository.create({
      comment: { id: commentId } as any,
      task: null, // Comment attachments don't have a direct task reference
      user: { id: userId } as any,
      filename: file.originalname,
      url: `/attachments/${uniqueFilename}`,
      mimeType: file.mimetype || null,
      size: file.size,
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);

    // Reload with relations
    const attachmentWithRelations = await this.attachmentRepository.findOne({
      where: { id: savedAttachment.id },
      relations: ['user', 'task', 'comment'],
    });

    if (!attachmentWithRelations) {
      throw new NotFoundException('Attachment not found after creation');
    }

    // Track activity on the comment's task (if available)
    if (comment.task) {
      try {
        await this.activitiesService.createActivity(
          comment.task.id,
          userId,
          'comment_attachment_uploaded',
          null,
          {
            commentId,
            attachmentId: attachmentWithRelations.id,
            filename: attachmentWithRelations.filename,
            size: attachmentWithRelations.size,
          },
        );
      } catch (error) {
        // Activity tracking failure shouldn't break the upload
      }
    }

    return {
      id: attachmentWithRelations.id,
      taskId: attachmentWithRelations.task?.id || null,
      commentId: attachmentWithRelations.comment?.id || null,
      userId: attachmentWithRelations.user.id,
      userEmail: attachmentWithRelations.user.email,
      userName: attachmentWithRelations.user.name,
      filename: attachmentWithRelations.filename,
      url: attachmentWithRelations.url,
      mimeType: attachmentWithRelations.mimeType,
      size: attachmentWithRelations.size,
      createdAt: attachmentWithRelations.createdAt,
      updatedAt: attachmentWithRelations.updatedAt,
    };
  }

  /**
   * Get all attachments for a comment
   */
  async findAllByComment(commentId: string): Promise<AttachmentResponseDto[]> {
    // Validate comment exists
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const attachments = await this.attachmentRepository.find({
      where: {
        comment: { id: commentId },
      },
      relations: ['user', 'task', 'comment'],
      order: { createdAt: 'DESC' },
    });

    return attachments.map((attachment) => ({
      id: attachment.id,
      taskId: attachment.task?.id || null,
      commentId: attachment.comment?.id || null,
      userId: attachment.user.id,
      userEmail: attachment.user.email,
      userName: attachment.user.name,
      filename: attachment.filename,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    }));
  }

  /**
   * Get a single attachment
   */
  async findOne(id: string): Promise<AttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['user', 'task', 'comment'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return {
      id: attachment.id,
      taskId: attachment.task?.id || null,
      commentId: attachment.comment?.id || null,
      userId: attachment.user.id,
      userEmail: attachment.user.email,
      userName: attachment.user.name,
      filename: attachment.filename,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    };
  }

  /**
   * Get file buffer for download/preview
   */
  async getFileBuffer(id: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string | null;
  }> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Extract filename from URL (e.g., /attachments/uuid_filename.ext -> uuid_filename.ext)
    const urlFilename = attachment.url.replace('/attachments/', '');
    const filePath = path.join(this.uploadPath, urlFilename);

    try {
      const buffer = await fs.readFile(filePath);
      return {
        buffer,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
      };
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  /**
   * Delete attachment
   */
  async remove(id: string, userId?: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['task', 'comment', 'comment.task'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Get taskId from either task or comment's task
    let taskId: string | null = null;
    if (attachment.task) {
      taskId = attachment.task.id;
    } else if (attachment.comment?.task) {
      taskId = attachment.comment.task.id;
    }
    const filename = attachment.filename;

    // Extract filename from URL
    const urlFilename = attachment.url.replace('/attachments/', '');
    const filePath = path.join(this.uploadPath, urlFilename);

    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, continue with database deletion
    }

    // Delete database record
    await this.attachmentRepository.remove(attachment);

    // Track activity (only if taskId is available)
    if (userId && taskId) {
      try {
        await this.activitiesService.createActivity(
          taskId,
          userId,
          attachment.comment ? 'comment_attachment_deleted' : 'task_attachment_deleted',
          {
            attachmentId: id,
            filename,
            commentId: attachment.comment?.id || null,
          },
          null,
        );
      } catch (error) {
        // Activity tracking failure shouldn't break the deletion
        // Log error if needed
      }
    }
  }
}
