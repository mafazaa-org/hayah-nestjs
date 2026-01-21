import { AttachmentResponseDto } from '../../attachments/dto/attachment-response.dto';

export class CommentResponseDto {
  id: string;
  taskId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  content: string;
  mentions: string[]; // Array of mentioned user IDs extracted from content
  attachments: AttachmentResponseDto[]; // Array of attachments for this comment
  createdAt: Date;
  updatedAt: Date;
}
