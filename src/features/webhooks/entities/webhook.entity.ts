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
import { UserEntity } from '../../users/entities/user.entity';
import { ListEntity } from '../../lists/entities/list.entity';
import { WebhookDeliveryEntity } from './webhook-delivery.entity';

export const WEBHOOK_EVENTS = [
  'task.created',
  'task.updated',
  'task.deleted',
] as const;
export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];

/**
 * WebhookEntity
 *
 * Outgoing webhook subscription: POST to URL when task events occur in a list.
 * Scoped to a list and owner (userId). Payloads are signed with secret (HMAC-SHA256).
 */
@Entity('webhooks')
export class WebhookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ListEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

  @Column({ type: 'text' })
  url: string;

  /** HMAC-SHA256 secret for X-Hayah-Webhook-Signature. Stored hashed or plain per project policy. */
  @Column({ type: 'text' })
  secret: string;

  /** Subscribed events: task.created, task.updated, task.deleted */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  events: WebhookEventType[];

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => WebhookDeliveryEntity, (d) => d.webhook)
  deliveries: WebhookDeliveryEntity[];
}
