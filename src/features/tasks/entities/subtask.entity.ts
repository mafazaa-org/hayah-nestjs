import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';

/**
 * SubtaskEntity
 *
 * Represents a subtask within a parent task.
 * Allows breaking down tasks into smaller, trackable components.
 */
@Entity('subtasks')
export class SubtaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'boolean',
    name: 'is_completed',
    default: false,
  })
  isCompleted: boolean;

  @Column({
    type: 'integer',
    name: 'order_index',
    default: 0,
  })
  orderIndex: number;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

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
