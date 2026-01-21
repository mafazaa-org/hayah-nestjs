import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  parentFolderId?: string;
}
