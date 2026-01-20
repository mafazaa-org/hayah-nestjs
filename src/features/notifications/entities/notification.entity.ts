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
 * NotificationEntity
 *
 * Represents a notification for a user.
 * Can be related to various entities (tasks, comments, etc.) via related_id.
 */
@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  type: string;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'text',
  })
  message: string;

  @Column({
    type: 'text',
    name: 'related_id',
    nullable: true,
  })
  relatedId: string | null;

  @Column({
    type: 'boolean',
    name: 'is_read',
    default: false,
  })
  isRead: boolean;

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

