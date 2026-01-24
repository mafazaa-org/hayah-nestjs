export class ListResponseDto {
  id: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  visibility: 'private' | 'shared';
  defaultViewConfig: {
    type?: 'kanban' | 'table' | 'calendar' | 'timeline';
    [key: string]: any;
  } | null;
  folderId: string | null;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}