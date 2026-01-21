export class TaskDependencyResponseDto {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'blocked_by';
  createdAt: Date;
}
