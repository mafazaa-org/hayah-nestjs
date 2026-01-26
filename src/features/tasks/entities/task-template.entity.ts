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
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';

/**
 * TaskTemplateEntity
 *
 * Represents a reusable template for creating tasks.
 * Templates store the configuration needed to recreate a task structure,
 * including title, description, priority, subtasks, checklists, tags, etc.
 */
@Entity('task_templates')
export class TaskTemplateEntity {
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
  description: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isPublic: boolean;

  @Column({
    type: 'jsonb',
    name: 'template_config',
  })
  templateConfig: {
    // Task title (required when creating from template)
    title: string;
    // Task description
    description?: string;
    // Priority ID (optional - will be resolved when creating task)
    priorityId?: string;
    // Due date offset in days (optional - e.g., 7 means 7 days from creation)
    dueDateOffsetDays?: number;
    // Subtasks to create
    subtasks?: Array<{
      title: string;
      orderIndex: number;
    }>;
    // Checklists to create
    checklists?: Array<{
      title: string;
      orderIndex: number;
      items?: Array<{
        title: string;
        orderIndex: number;
      }>;
    }>;
    // Tag names to attach (will be resolved by name when creating task)
    tagNames?: string[];
    // Custom field values
    customFieldValues?: Array<{
      customFieldName: string;
      value: any;
    }>;
    // Any other template settings
    [key: string]: any;
  };

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity | null;

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
