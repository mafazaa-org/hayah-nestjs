export class WebhookResponseDto {
  id: string;
  url: string;
  listId: string;
  events: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
