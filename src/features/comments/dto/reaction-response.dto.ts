export class ReactionResponseDto {
  id: string;
  emoji: string;
  userId: string;
  userName: string | null;
  createdAt: Date;
}
