import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ListEntity } from './list.entity';

/**
 * ViewEntity
 *
 * Represents a saved view configuration for a list.
 * Allows users to save custom view configurations (kanban, table, calendar, etc.)
 * with personalized settings stored as JSON.
 */
@Entity('views')
export class ViewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  type: 'kanban' | 'table' | 'calendar' | 'timeline';

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

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;
}
