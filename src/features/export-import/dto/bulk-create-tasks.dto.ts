import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkCreateTaskItemDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderPosition?: number;
}

export class BulkCreateTasksDto {
  @IsUUID()
  listId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateTaskItemDto)
  tasks: BulkCreateTaskItemDto[];
}
