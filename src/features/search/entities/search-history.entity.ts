import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * SearchHistoryEntity
 *
 * Tracks recent searches performed by users for quick access to search history.
 */
@Entity('search_history')
export class SearchHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  query: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'filters',
  })
  filters: {
    assigneeId?: string;
    statusId?: string;
    dateFrom?: string;
    dateTo?: string;
    workspaceId?: string;
    listId?: string;
  } | null;

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
