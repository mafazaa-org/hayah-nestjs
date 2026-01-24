export class NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}
