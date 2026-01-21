import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChecklistItemOrderItemDto {
  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderChecklistItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemOrderItemDto)
  itemOrders: ChecklistItemOrderItemDto[];
}