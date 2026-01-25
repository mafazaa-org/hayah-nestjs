import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class BulkDeleteTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  taskIds: string[];
}
