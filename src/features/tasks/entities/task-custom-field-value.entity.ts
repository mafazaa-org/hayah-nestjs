import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomFieldEntity } from '../../lists/entities/custom-field.entity';
import { TaskEntity } from './task.entity';

/**
 * TaskCustomFieldValueEntity
 *
 * Represents a custom field value for a task.
 * Links a task to a custom field definition and stores the value as JSON
 * to support different field types (text, number, date, dropdown).
 */
@Entity('task_custom_field_values')
export class TaskCustomFieldValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'jsonb',
  })
  value: any;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => CustomFieldEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'custom_field_id' })
  customField: CustomFieldEntity;

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
