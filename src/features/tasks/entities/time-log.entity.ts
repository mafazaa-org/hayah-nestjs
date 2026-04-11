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
import { UserEntity } from '../../users/entities/user.entity';

/**
 * TimeLogEntity
 * 
 * Represents a tracked time session against a specific task by a specific user.
 */
@Entity('time_logs')
export class TimeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskEntity, (task) => task.timeLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => UserEntity, undefined, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'timestamp',
    name: 'start_time',
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
    name: 'end_time',
    nullable: true, // Null means tracking is currently active (timer is running)
  })
  endTime: Date | null;

  @Column({
    type: 'integer',
    name: 'duration_seconds',
    default: 0,
  })
  durationSeconds: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

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
