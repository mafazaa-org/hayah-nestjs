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
import { TaskIterationEntity } from '../../tasks/entities/task-iteration.entity';
import { ListEntity } from './list.entity';

/**
 * IterationEntity / Sprint
 *
 * Represents an iteration/sprint within a list (optional feature).
 * Used for organizing tasks into time-boxed periods.
 */
@Entity('iterations')
export class IterationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'date',
    name: 'start_date',
    nullable: true,
  })
  startDate: Date | null;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: true,
  })
  endDate: Date | null;

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
  @OneToMany(() => TaskIterationEntity, (taskIteration) => taskIteration.iteration)
  taskIterations: TaskIterationEntity[];
}
