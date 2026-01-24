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
 * ListTemplateEntity
 *
 * Represents a reusable template for creating lists.
 * Templates store the configuration needed to recreate a list structure,
 * including default statuses, custom fields, view configurations, etc.
 */
@Entity('list_templates')
export class ListTemplateEntity {
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
    // Statuses to create
    statuses?: Array<{
      name: string;
      orderIndex: number;
      color?: string;
    }>;
    // Custom fields configuration
    customFields?: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
      config?: any;
    }>;
    // Default view configuration
    defaultViewConfig?: {
      type?: 'kanban' | 'table' | 'calendar' | 'timeline';
      [key: string]: any;
    };
    // Default visibility
    visibility?: 'private' | 'shared';
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