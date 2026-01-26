import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTaskTemplateDto {
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
    title: string;
    description?: string;
    priorityId?: string;
    dueDateOffsetDays?: number;
    subtasks?: Array<{
      title: string;
      orderIndex: number;
    }>;
    checklists?: Array<{
      title: string;
      orderIndex: number;
      items?: Array<{
        title: string;
        orderIndex: number;
      }>;
    }>;
    tagNames?: string[];
    customFieldValues?: Array<{
      customFieldName: string;
      value: any;
    }>;
    [key: string]: any;
  };
}
