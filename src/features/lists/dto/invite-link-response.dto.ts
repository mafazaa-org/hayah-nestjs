export class InviteLinkResponseDto {
  id: string;
  token: string;
  listId: string;
  role: string;
  expiresAt: Date | null;
  createdAt: Date;
}
