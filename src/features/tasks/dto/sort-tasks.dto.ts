import { IsEnum, IsOptional } from 'class-validator';

export enum SortField {
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  ORDER_POSITION = 'orderPosition',
  ASSIGNEE = 'assignee',
  CUSTOM_FIELD = 'customField',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SortTasksDto {
  @IsEnum(SortField)
  field: SortField;

  @IsOptional()
  @IsEnum(SortDirection)
  direction?: SortDirection;
}
