import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateListFromTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}