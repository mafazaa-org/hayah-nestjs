import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ViewConfigDto } from './view-config.dto';

export type ViewType = 'kanban' | 'table' | 'calendar' | 'timeline';

const VIEW_TYPES: ViewType[] = ['kanban', 'table', 'calendar', 'timeline'];

export class CreateViewDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsUUID()
  listId: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(VIEW_TYPES)
  type: ViewType;

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewConfigDto)
  config?: ViewConfigDto;
}
