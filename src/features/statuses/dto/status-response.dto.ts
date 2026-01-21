export class StatusResponseDto {
  id: string;
  name: string;
  orderIndex: number;
  color: string | null;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}