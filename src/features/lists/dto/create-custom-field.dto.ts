import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
}

export class CreateCustomFieldDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(CustomFieldType)
  type: CustomFieldType;

  @IsUUID()
  listId: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
