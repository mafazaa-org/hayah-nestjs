import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { WEBHOOK_EVENTS, type WebhookEventType } from '../entities/webhook.entity';

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @IsArray()
  @IsIn(WEBHOOK_EVENTS as unknown as string[], { each: true })
  events?: WebhookEventType[];

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  /** Optional. If provided, must be at least 16 characters. */
  @IsOptional()
  @IsString()
  @MinLength(16, { message: 'Secret must be at least 16 characters' })
  secret?: string;
}
