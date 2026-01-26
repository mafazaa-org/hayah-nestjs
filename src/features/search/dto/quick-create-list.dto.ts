import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/**
 * QuickCreateListDto
 *
 * Simplified DTO for quick list creation with minimal required fields.
 */
export class QuickCreateListDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}
