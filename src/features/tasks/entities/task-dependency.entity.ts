import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';

/**
 * TaskDependencyEntity
 *
 * Represents a directed dependency relationship between tasks.
 * Creates a directed graph where tasks can depend on other tasks,
 * with support for "blocks" and "blocked_by" relationship types.
 */
@Entity('task_dependencies')
export class TaskDependencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'depends_on_task_id' })
  dependsOnTask: TaskEntity;

  @Column({
    type: 'text',
  })
  type: 'blocks' | 'blocked_by';

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;
}
