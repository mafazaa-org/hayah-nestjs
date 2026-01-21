import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTaskCustomFieldValueDto {
  @IsOptional()
  @IsNotEmpty()
  value?: any; // Can be string, number, date, or array for dropdown
}
