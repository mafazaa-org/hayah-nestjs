import { ListEntity } from '../../lists/entities/list.entity';
import { StatusEntity } from '../../statuses/entities/status.entity';
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
import { ActivityEntity } from './activity.entity';
import { AssignmentEntity } from './assignment.entity';
import { AttachmentEntity } from '../../attachments/entities/attachment.entity';
import { ChecklistEntity } from './checklist.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { SubtaskEntity } from './subtask.entity';
import { TaskCustomFieldValueEntity } from './task-custom-field-value.entity';
import { TaskDependencyEntity } from './task-dependency.entity';
import { TaskIterationEntity } from './task-iteration.entity';
import { TaskTagEntity } from './task-tag.entity';
import { TaskPriorityEntity } from './task-priority.entity';

/**
 * TaskEntity
 *
 * Represents a task/item on a Kanban board.
 * Belongs to a List and has a Status (column position).
 */
@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'date',
    name: 'due_date',
    nullable: true,
  })
  dueDate: Date | null;

  @Column({
    type: 'integer',
    name: 'order_position',
    default: 0,
  })
  orderPosition: number;

  @Column({
    type: 'boolean',
    name: 'is_archived',
    default: false,
  })
  isArchived: boolean;

  @ManyToOne('ListEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

  @ManyToOne('StatusEntity', {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'status_id' })
  status: StatusEntity | null;

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
  @OneToMany(() => AssignmentEntity, (assignment) => assignment.task)
  assignments: AssignmentEntity[];

  @OneToMany(() => SubtaskEntity, (subtask) => subtask.task)
  subtasks: SubtaskEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.task)
  comments: CommentEntity[];

  @OneToMany(() => AttachmentEntity, (attachment) => attachment.task)
  attachments: AttachmentEntity[];

  @OneToMany(() => TaskTagEntity, (taskTag) => taskTag.task)
  taskTags: TaskTagEntity[];

  @OneToMany(() => TaskIterationEntity, (taskIteration) => taskIteration.task)
  taskIterations: TaskIterationEntity[];

  @OneToMany(() => TaskDependencyEntity, (taskDependency) => taskDependency.task)
  taskDependencies: TaskDependencyEntity[];

  @OneToMany(() => ChecklistEntity, (checklist) => checklist.task)
  checklists: ChecklistEntity[];

  @OneToMany(() => TaskCustomFieldValueEntity, (taskCustomFieldValue) => taskCustomFieldValue.task)
  taskCustomFieldValues: TaskCustomFieldValueEntity[];

  @OneToMany(() => ActivityEntity, (activity) => activity.task)
  activities: ActivityEntity[];

  @ManyToOne(() => TaskPriorityEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'priority_id' })
  priority: TaskPriorityEntity | null;
}
