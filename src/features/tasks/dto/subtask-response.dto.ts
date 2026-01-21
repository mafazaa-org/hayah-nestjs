export class SubtaskResponseDto {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}