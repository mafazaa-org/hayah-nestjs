export class CustomFieldResponseDto {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  listId: string;
  config: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
