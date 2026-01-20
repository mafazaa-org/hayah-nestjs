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
import { TaskTagEntity } from '../../tasks/entities/task-tag.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';

/**
 * TagEntity / Label
 *
 * Represents a tag/label that can be applied to tasks.
 * Belongs to a Workspace and can be associated with multiple tasks.
 */
@Entity('tags')
export class TagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  color: string | null;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity;

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
  @OneToMany(() => TaskTagEntity, (taskTag) => taskTag.tag)
  taskTags: TaskTagEntity[];
}
