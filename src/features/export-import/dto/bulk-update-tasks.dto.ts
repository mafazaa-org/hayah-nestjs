import {
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  ArrayMinSize,
  IsString,
  IsIn,
} from 'class-validator';

export class BulkUpdateTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  taskIds: string[];

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsUUID()
  priorityId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  /** 'override' (default) replaces all, 'append' adds new, 'remove' removes specific */
  @IsOptional()
  @IsString()
  @IsIn(['override', 'append', 'remove'])
  operationType?: 'override' | 'append' | 'remove';
}
