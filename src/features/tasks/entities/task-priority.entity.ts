import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskEntity } from './task.entity';

/**
 * TaskPriorityEntity
 *
 * Represents a priority level for tasks (e.g., "Low", "Medium", "High", "Critical").
 * Can be used as a separate table for customizable priorities with colors,
 * or tasks can use an enum directly if simpler implementation is preferred.
 */
@Entity('task_priorities')
export class TaskPriorityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  color: string | null;

  @Column({
    type: 'integer',
    name: 'order_index',
    default: 0,
  })
  orderIndex: number;

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

  // One-To-Many relationships
  // Note: This relationship requires TaskEntity to have a priority_id field
  // that references TaskPriorityEntity (if using separate table instead of enum)
  @OneToMany(() => TaskEntity, (task) => task.priority)
  tasks: TaskEntity[];
}
