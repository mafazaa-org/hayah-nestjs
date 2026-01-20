import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TagEntity } from '../../tags/entities/tag.entity';
import { TaskEntity } from './task.entity';

/**
 * TaskTagEntity
 *
 * Join table for the Many-To-Many relationship between Tasks and Tags.
 * Allows tasks to have multiple tags and tags to be applied to multiple tasks.
 */
@Entity('task_tags')
export class TaskTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => TagEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;
}
