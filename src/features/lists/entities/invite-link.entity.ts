import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ListEntity } from './list.entity';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * InviteLinkEntity
 *
 * Represents a shareable invite link for a list.
 * Contains a unique token that can be shared to allow others to join the list.
 */
@Entity('invite_links')
export class InviteLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    unique: true,
  })
  token: string;

  @Column({
    type: 'text',
    default: 'viewer',
  })
  role: string;

  @ManyToOne(() => ListEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

  @ManyToOne(() => UserEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity | null;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
    nullable: true,
  })
  expiresAt: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;
}
