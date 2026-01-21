import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchTasksDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsUUID()
  listId?: string;

  @IsOptional()
  @IsUUID()
  workspaceId?: string;
}
