import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { TaskEntity } from './task.entity';

/**
 * ActivityEntity / History
 *
 * Represents an activity/history entry for a task.
 * Tracks changes made to tasks with old and new values for audit purposes.
 */
@Entity('activities')
export class ActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    name: 'action_type',
  })
  actionType: string;

  @Column({
    type: 'jsonb',
    name: 'old_value',
    nullable: true,
  })
  oldValue: any | null;

  @Column({
    type: 'jsonb',
    name: 'new_value',
    nullable: true,
  })
  newValue: any | null;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

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
}
