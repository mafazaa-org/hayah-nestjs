import { IsString, IsUUID, MinLength } from 'class-validator';

/**
 * QuickCreateTaskDto
 *
 * Simplified DTO for quick task creation with minimal required fields.
 * Uses smart defaults for status, priority, etc.
 */
export class QuickCreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsUUID()
  listId: string;
}
