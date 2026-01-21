import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  // Note: avatar would be handled separately via file upload
  // For now, we'll just include the field for future implementation
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
