import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, any>;
}
