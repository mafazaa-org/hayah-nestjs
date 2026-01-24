import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterGroupDto } from '../../tasks/dto/filter-tasks.dto';
import { SortField, SortDirection } from '../../tasks/dto/sort-tasks.dto';

const VIEW_TYPES = ['kanban', 'table', 'calendar', 'timeline'] as const;

/**
 * View configuration: columns (show/hide), filters, sorting, and view-type-specific options.
 * Used in ViewEntity.config, list defaultViewConfig, and when fetching tasks by view.
 */
export class ViewConfigDto {
  /** Column visibility for table view. Keys: title, description, status, priority, assignee, dueDate, tags, createdAt, updatedAt, or customField:{uuid} */
  @IsOptional()
  @IsObject()
  columns?: Record<string, boolean>;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterGroupDto)
  filters?: FilterGroupDto;

  @IsOptional()
  @IsEnum(SortField)
  sortField?: SortField;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  /** Required when sortField is customField */
  @IsOptional()
  @IsUUID()
  customFieldId?: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  /** Calendar: 0 = Sunday, 6 = Saturday */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  startOfWeek?: number;
}

/**
 * Default view configuration per list. Extends ViewConfigDto with type.
 * Stored in ListEntity.defaultViewConfig.
 */
export class DefaultViewConfigDto extends ViewConfigDto {
  @IsOptional()
  @IsString()
  @IsIn([...VIEW_TYPES])
  type?: (typeof VIEW_TYPES)[number];
}
