import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';

/**
 * AttachmentEntity
 *
 * Represents a file attachment on a task or comment.
 * Tracks file metadata including filename, URL, MIME type, and size.
 * Can be attached to either a task (task_id) or a comment (comment_id).
 */
@Entity('attachments')
export class AttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    name: 'filename',
  })
  filename: string;

  @Column({
    type: 'text',
    name: 'url',
  })
  url: string;

  @Column({
    type: 'text',
    name: 'mime_type',
    nullable: true,
  })
  mimeType: string | null;

  @Column({
    type: 'bigint',
    default: 0,
  })
  size: number;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity | null;

  @ManyToOne(() => CommentEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'comment_id' })
  comment: CommentEntity | null;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}

