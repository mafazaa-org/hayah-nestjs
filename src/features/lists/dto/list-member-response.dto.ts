export class ListMemberResponseDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  listId: string;
  role: 'owner' | 'editor' | 'viewer';
  createdAt: Date;
}
