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
 * FilterPresetEntity
 *
 * Represents a saved filter preset for a list, created by a user.
 * Stores filter configuration as JSON to allow flexible filtering criteria.
 */
@Entity('filter_presets')
export class FilterPresetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'jsonb',
    name: 'filter_config',
  })
  filterConfig: Record<string, any>;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

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
}
