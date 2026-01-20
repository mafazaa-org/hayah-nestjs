import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * UserSettingsEntity
 *
 * Represents user preferences and settings (optional One-To-One relationship).
 * Stores user-specific configuration like timezone, language, and notification preferences.
 */
@Entity('user_settings')
@Index(['user'], { unique: true }) // Ensures user_id is unique
export class UserSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  timezone: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  language: string | null;

  @Column({
    type: 'jsonb',
    name: 'notification_preferences',
    nullable: true,
  })
  notificationPreferences: Record<string, any> | null;

  @OneToOne(() => UserEntity, (user) => user.settings, {
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
