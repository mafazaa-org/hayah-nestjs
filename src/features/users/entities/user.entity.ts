import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityEntity } from '../../tasks/entities/activity.entity';
import { AssignmentEntity } from '../../tasks/entities/assignment.entity';
import { AttachmentEntity } from '../../attachments/entities/attachment.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { FilterPresetEntity } from '../../lists/entities/filter-preset.entity';
import { ListMemberEntity } from '../../lists/entities/list-member.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';
import { ViewEntity } from '../../lists/entities/view.entity';
import { UserSettingsEntity } from './user-settings.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    name: 'password_hash',
  })
  passwordHash: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  name: string | null;

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

  // One-To-One relationships
  @OneToOne(() => UserSettingsEntity, (settings) => settings.user)
  settings: UserSettingsEntity;

  // One-To-Many relationships
  @OneToMany(() => FilterPresetEntity, (filterPreset) => filterPreset.user)
  filterPresets: FilterPresetEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.user)
  attachments: AttachmentEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => AssignmentEntity, (assignment) => assignment.user)
  assignments: AssignmentEntity[];

  @OneToMany(() => ListMemberEntity, (listMember) => listMember.user)
  listMemberships: ListMemberEntity[];

  @OneToMany(() => ActivityEntity, (activity) => activity.user)
  activities: ActivityEntity[];

  @OneToMany(() => ViewEntity, (view) => view.user)
  views: ViewEntity[];
}
