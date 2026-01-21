import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateListDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  visibility?: 'private' | 'shared';

  @IsOptional()
  defaultViewConfig?: {
    type?: 'kanban' | 'table' | 'calendar';
    [key: string]: any;
  };
}