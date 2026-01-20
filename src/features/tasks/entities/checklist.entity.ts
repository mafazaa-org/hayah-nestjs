import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChecklistItemEntity } from './checklist-item.entity';
import { TaskEntity } from './task.entity';

/**
 * ChecklistEntity
 *
 * Represents a checklist within a task (separate from subtasks).
 * A task can have multiple checklists, each with multiple items.
 */
@Entity('task_checklists')
export class ChecklistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  title: string;

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

  // One-To-Many relationships
  @OneToMany(() => ChecklistItemEntity, (checklistItem) => checklistItem.checklist)
  checklistItems: ChecklistItemEntity[];
}
