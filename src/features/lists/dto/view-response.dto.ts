export class ViewResponseDto {
  id: string;
  name: string;
  type: string;
  config: Record<string, any> | null;
  listId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
