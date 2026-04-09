import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * CommentReactionEntity
 *
 * Represents a reaction (emoji) on a comment.
 * Unique constraint ensures a user can only add each emoji once per comment.
 */
@Entity('comment_reactions')
@Unique(['comment', 'user', 'emoji'])
export class CommentReactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  emoji: string;

  @ManyToOne(() => CommentEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment: CommentEntity;

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
