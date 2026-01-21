import { IsUUID } from 'class-validator';

export class AddTagToTaskDto {
  @IsUUID()
  tagId: string;
}