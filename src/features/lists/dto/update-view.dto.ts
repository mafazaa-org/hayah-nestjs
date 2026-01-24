import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ViewConfigDto } from './view-config.dto';

const VIEW_TYPES = ['kanban', 'table', 'calendar', 'timeline'] as const;

export class UpdateViewDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn([...VIEW_TYPES])
  type?: (typeof VIEW_TYPES)[number];

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewConfigDto)
  config?: ViewConfigDto;
}
