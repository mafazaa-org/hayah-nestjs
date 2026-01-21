import { IsEnum, IsUUID } from 'class-validator';

export enum DependencyType {
  BLOCKS = 'blocks',
  BLOCKED_BY = 'blocked_by',
}

export class CreateTaskDependencyDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  dependsOnTaskId: string;

  @IsEnum(DependencyType)
  type: DependencyType;
}
