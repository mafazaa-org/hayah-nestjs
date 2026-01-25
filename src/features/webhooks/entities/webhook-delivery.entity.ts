import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookEntity } from './webhook.entity';

export type WebhookDeliveryStatus = 'pending' | 'success' | 'failed';

/**
 * WebhookDeliveryEntity
 *
 * Tracks each webhook delivery attempt for retries and auditing.
 * Failed deliveries with nextRetryAt <= now are retried by a cron job.
 */
@Entity('webhook_deliveries')
export class WebhookDeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WebhookEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhook_id' })
  webhook: WebhookEntity;

  @Column({ type: 'text' })
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'int', default: 1 })
  attempt: number;

  @Column({
    type: 'text',
    default: 'pending',
  })
  status: WebhookDeliveryStatus;

  @Column({ type: 'int', name: 'response_status_code', nullable: true })
  responseStatusCode: number | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'timestamp', name: 'next_retry_at', nullable: true })
  nextRetryAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
