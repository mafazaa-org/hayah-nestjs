import { IsBoolean, IsOptional } from 'class-validator';

export class DuplicateListDto {
  @IsOptional()
  @IsBoolean()
  includeTasks?: boolean;
}