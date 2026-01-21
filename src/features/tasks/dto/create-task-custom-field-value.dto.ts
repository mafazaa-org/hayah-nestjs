import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTaskCustomFieldValueDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  customFieldId: string;

  @IsNotEmpty()
  value: any; // Can be string, number, date, or array for dropdown
}
