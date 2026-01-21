import { FilterGroupDto } from '../../tasks/dto/filter-tasks.dto';

export class FilterPresetResponseDto {
  id: string;
  name: string;
  userId: string;
  listId: string;
  filterConfig: FilterGroupDto;
  includeArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
