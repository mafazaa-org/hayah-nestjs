import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';
import { WEBHOOK_EVENTS, type WebhookEventType } from '../entities/webhook.entity';

export class CreateWebhookDto {
  @IsUrl({ require_tld: false })
  url: string;

  @IsUUID()
  listId: string;

  @IsArray()
  @IsIn(WEBHOOK_EVENTS as unknown as string[], { each: true })
  events: WebhookEventType[];

  /** Optional. If omitted, a random secret is generated. */
  @IsOptional()
  @IsString()
  @MinLength(16, { message: 'Secret must be at least 16 characters' })
  secret?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
