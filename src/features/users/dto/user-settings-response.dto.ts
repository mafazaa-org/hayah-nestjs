export class UserSettingsResponseDto {
  id: string;
  timezone: string | null;
  language: string | null;
  notificationPreferences: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}
