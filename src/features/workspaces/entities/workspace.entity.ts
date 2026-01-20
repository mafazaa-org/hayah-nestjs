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
import { ListEntity } from '../../lists/entities/list.entity';
import { TagEntity } from '../../tags/entities/tag.entity';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * WorkspaceEntity / Team
 *
 * Represents a logical workspace/team that owns folders, lists, tags, etc.
 * For the current MVP this is primarily used to model "user shared lists"
 * via `workspace_id` on related tables.
 */
@Entity('workspaces')
export class WorkspaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

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
  @OneToMany(() => FolderEntity, (folder) => folder.workspace)
  folders: FolderEntity[];

  @OneToMany(() => ListEntity, (list) => list.workspace)
  lists: ListEntity[];

  @OneToMany(() => TagEntity, (tag) => tag.workspace)
  tags: TagEntity[];
}

