import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StatusOrderItemDto {
  @IsUUID()
  statusId: string;

  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderStatusesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusOrderItemDto)
  statusOrders: StatusOrderItemDto[];
}