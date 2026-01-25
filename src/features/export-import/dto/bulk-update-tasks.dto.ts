import {
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  ArrayMinSize,
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
}
