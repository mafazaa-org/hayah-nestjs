import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateListTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsUUID()
  workspaceId?: string;

  @IsObject()
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
      type?: 'kanban' | 'table' | 'calendar';
      [key: string]: any;
    };
    visibility?: 'private' | 'shared';
    [key: string]: any;
  };
}