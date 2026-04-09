export class SavedSearchResponseDto {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
