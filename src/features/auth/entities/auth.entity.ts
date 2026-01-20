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

/**
 * AuthEntity
 *
 * Stores long-lived authentication artifacts for a user (e.g. refresh tokens).
 * This will be used in Phase 5 (Authorization & Authentication) but is defined
 * here as part of the overall database schema design.
 */
@Entity('auth_tokens')
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'text',
    name: 'refresh_token',
    unique: true,
  })
  refreshToken: string;

  @Column({
    type: 'timestamp',
    name: 'expires_at',
  })
  expiresAt: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  revoked: boolean;

  @Column({
    type: 'timestamp',
    name: 'revoked_at',
    nullable: true,
  })
  revokedAt: Date | null;

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
