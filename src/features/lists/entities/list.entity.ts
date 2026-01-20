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
import { FolderEntity } from '../../folders/entities/folder.entity';
import { StatusEntity } from '../../statuses/entities/status.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { CustomFieldEntity } from './custom-field.entity';
import { FilterPresetEntity } from './filter-preset.entity';
import { IterationEntity } from './iteration.entity';
import { ListMemberEntity } from './list-member.entity';
import { ViewEntity } from './view.entity';

/**
 * ListEntity
 *
 * Represents a task list/board (e.g., a Kanban board).
 * Belongs to a Folder and a Workspace, and contains Statuses, Tasks, etc.
 */
@Entity('lists')
export class ListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @ManyToOne('FolderEntity', {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'folder_id' })
  folder: FolderEntity | null;

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
  @OneToMany(() => StatusEntity, (status) => status.list)
  statuses: StatusEntity[];

  @OneToMany(() => TaskEntity, (task) => task.list)
  tasks: TaskEntity[];

  @OneToMany(() => IterationEntity, (iteration) => iteration.list)
  iterations: IterationEntity[];

  @OneToMany(() => CustomFieldEntity, (customField) => customField.list)
  customFields: CustomFieldEntity[];

  @OneToMany(() => ViewEntity, (view) => view.list)
  views: ViewEntity[];

  @OneToMany(() => FilterPresetEntity, (filterPreset) => filterPreset.list)
  filterPresets: FilterPresetEntity[];

  @OneToMany(() => ListMemberEntity, (listMember) => listMember.list)
  listMembers: ListMemberEntity[];
}
