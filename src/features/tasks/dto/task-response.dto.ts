export class TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  orderPosition: number;
  isArchived: boolean;
  listId: string;
  statusId: string | null;
  priorityId: string | null;
  createdAt: Date;
  updatedAt: Date;
}