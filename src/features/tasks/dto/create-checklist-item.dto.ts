import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsUUID()
  checklistId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}