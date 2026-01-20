import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ListEntity } from './list.entity';

/**
 * ListMemberEntity
 *
 * Join table for the Many-To-Many relationship between Users and Lists.
 * Encodes per-list permissions/roles for collaborative access.
 */
@Entity('list_members')
export class ListMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ListEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

  @Column({
    type: 'text',
  })
  role: 'owner' | 'editor' | 'viewer';

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;
}

