export class ChecklistItemResponseDto {
  id: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
  checklistId: string;
  createdAt: Date;
  updatedAt: Date;
}