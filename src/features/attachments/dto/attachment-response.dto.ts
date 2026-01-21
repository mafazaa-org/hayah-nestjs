export class AttachmentResponseDto {
  id: string;
  taskId: string | null;
  commentId: string | null;
  userId: string;
  userEmail: string;
  userName: string | null;
  filename: string;
  url: string;
  mimeType: string | null;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
