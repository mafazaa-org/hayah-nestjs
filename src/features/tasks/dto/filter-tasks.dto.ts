import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export enum FilterLogic {
  AND = 'and',
  OR = 'or',
}

export class FilterConditionDto {
  @IsString()
  field:
    | 'assignee'
    | 'status'
    | 'priority'
    | 'tag'
    | 'dueDate'
    | 'list'
    | 'isArchived'
    | 'customField';

  @IsEnum(FilterOperator)
  operator: FilterOperator;

  @IsOptional()
  value?: string | string[] | boolean | number | Date;

  /** Required when field is 'customField'. UUID of the custom field. */
  @ValidateIf((o) => o.field === 'customField')
  @IsUUID()
  customFieldId?: string;
}

export class FilterGroupDto {
  @IsEnum(FilterLogic)
  logic: FilterLogic;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterConditionDto)
  conditions: FilterConditionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterGroupDto)
  groups?: FilterGroupDto[];
}

export class FilterTasksDto {
  @IsOptional()
  @IsUUID()
  listId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterGroupDto)
  filters?: FilterGroupDto;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}
