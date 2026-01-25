export class WebhookDeliveryResponseDto {
  id: string;
  webhookId: string;
  event: string;
  attempt: number;
  status: string;
  responseStatusCode: number | null;
  errorMessage: string | null;
  nextRetryAt: Date | null;
  createdAt: Date;
}
