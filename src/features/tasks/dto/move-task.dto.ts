import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @IsOptional()
  @IsUUID()
  statusId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderPosition?: number;
}