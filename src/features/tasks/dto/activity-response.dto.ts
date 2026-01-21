export class ActivityResponseDto {
  id: string;
  taskId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  actionType: string;
  oldValue: any | null;
  newValue: any | null;
  createdAt: Date;
}
