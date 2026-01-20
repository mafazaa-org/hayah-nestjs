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
import { ListEntity } from '../../lists/entities/list.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';

/**
 * FolderEntity
 *
 * Represents a folder that can contain lists and other folders (nested hierarchy).
 * Supports infinite nesting depth (100+ levels) via self-referencing relationship.
 */
@Entity('folders')
export class FolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: WorkspaceEntity;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_folder_id' })
  parent: FolderEntity | null;

  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  children: FolderEntity[];

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
  @OneToMany(() => ListEntity, (list) => list.folder)
  lists: ListEntity[];
}
