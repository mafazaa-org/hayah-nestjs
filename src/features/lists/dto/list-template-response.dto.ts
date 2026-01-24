export class ListTemplateResponseDto {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  templateConfig: {
    statuses?: Array<{
      name: string;
      orderIndex: number;
      color?: string;
    }>;
    customFields?: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
      config?: any;
    }>;
    defaultViewConfig?: {
      type?: 'kanban' | 'table' | 'calendar' | 'timeline';
      [key: string]: any;
    };
    visibility?: 'private' | 'shared';
    [key: string]: any;
  };
  userId: string;
  workspaceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}