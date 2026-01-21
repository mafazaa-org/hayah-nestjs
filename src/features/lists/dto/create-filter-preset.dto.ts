import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FilterGroupDto } from '../../tasks/dto/filter-tasks.dto';

export class CreateFilterPresetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUUID()
  listId: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterGroupDto)
  filterConfig: FilterGroupDto;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}
