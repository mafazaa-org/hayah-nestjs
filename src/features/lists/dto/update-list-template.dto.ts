import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateListTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsObject()
  templateConfig?: {
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
}
