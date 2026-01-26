import { TaskEntity } from '../../tasks/entities/task.entity';
import { ListEntity } from '../../lists/entities/list.entity';

export class GlobalSearchResultDto {
  tasks: TaskEntity[];
  lists: ListEntity[];
  totalTasks: number;
  totalLists: number;
  query: string;
}
