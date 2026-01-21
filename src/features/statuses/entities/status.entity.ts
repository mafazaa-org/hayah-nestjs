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
import { ListEntity } from '../../lists/entities/list.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';

/**
 * StatusEntity / Column
 *
 * Represents a status/column in a Kanban board (e.g., "Todo", "In Progress", "Done").
 * Each list has multiple statuses that define the workflow columns.
 */
@Entity('statuses')
export class StatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'integer',
    name: 'order_index',
    default: 0,
  })
  orderIndex: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  color: string | null;

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
  @OneToMany(() => TaskEntity, (task) => task.status)
  tasks: TaskEntity[];
}
