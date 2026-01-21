import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { CustomFieldType } from './create-custom-field.dto';

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CustomFieldType)
  type?: CustomFieldType;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
