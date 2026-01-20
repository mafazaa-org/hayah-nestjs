import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IterationEntity } from '../../lists/entities/iteration.entity';
import { TaskEntity } from './task.entity';

/**
 * TaskIterationEntity
 *
 * Join table for the Many-To-Many relationship between Tasks and Iterations (Sprints).
 * Allows tasks to belong to multiple iterations and iterations to contain multiple tasks (optional feature).
 */
@Entity('task_iterations')
export class TaskIterationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;

  @ManyToOne(() => IterationEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iteration_id' })
  iteration: IterationEntity;
}
