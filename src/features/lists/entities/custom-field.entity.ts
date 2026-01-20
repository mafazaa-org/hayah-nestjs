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
import { TaskCustomFieldValueEntity } from '../../tasks/entities/task-custom-field-value.entity';
import { ListEntity } from './list.entity';

/**
 * CustomFieldEntity
 *
 * Represents a custom field definition for a list.
 * Allows lists to have custom fields of various types (text, number, date, dropdown).
 * Configuration is stored as JSON for flexibility.
 */
@Entity('custom_fields')
export class CustomFieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  type: 'text' | 'number' | 'date' | 'dropdown';

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  config: Record<string, any> | null;

  @ManyToOne('ListEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

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
  @OneToMany(() => TaskCustomFieldValueEntity, (taskCustomFieldValue) => taskCustomFieldValue.customField)
  taskCustomFieldValues: TaskCustomFieldValueEntity[];
}
