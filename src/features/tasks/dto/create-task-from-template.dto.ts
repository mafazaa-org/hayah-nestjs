import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTaskFromTemplateDto {
  @IsUUID()
  listId: string;

  @IsOptional()
  @IsUUID()
  statusId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string; // Override template title if provided
}
