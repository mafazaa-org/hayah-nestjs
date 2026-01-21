import { IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterGroupDto } from '../../tasks/dto/filter-tasks.dto';

export class UpdateFilterPresetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterGroupDto)
  filterConfig?: FilterGroupDto;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}
