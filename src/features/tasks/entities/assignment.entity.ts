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
 * AssignmentEntity
 *
 * Join table for the Many-To-Many relationship between Users and Tasks.
 * Tracks which users are assigned to which tasks.
 */
@Entity('assignments')
export class AssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'assigned_at',
  })
  assignedAt: Date;
}
