import { IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsUUID()
  taskId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}