import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChecklistEntity } from './checklist.entity';

/**
 * ChecklistItemEntity
 *
 * Represents an individual item within a checklist.
 * Each checklist can contain multiple items that can be marked as completed.
 */
@Entity('checklist_items')
export class ChecklistItemEntity {
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

  @ManyToOne(() => ChecklistEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'checklist_id' })
  checklist: ChecklistEntity;

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
