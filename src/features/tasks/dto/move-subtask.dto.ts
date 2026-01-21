import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveSubtaskDto {
  @IsUUID()
  targetTaskId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}