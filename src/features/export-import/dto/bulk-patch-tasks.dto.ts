import {
  IsArray,
  IsObject,
  IsUUID,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTaskDto } from '../../tasks/dto/update-task.dto';

export class BulkPatchItemDto {
  @IsUUID()
  id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateTaskDto)
  data: UpdateTaskDto;
}

export class BulkPatchTasksDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkPatchItemDto)
  patches: BulkPatchItemDto[];
}
