import { IsString, IsArray } from 'class-validator';

export class ReorderCustomFieldsDto {
  @IsString()
  listId: string;

  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}
