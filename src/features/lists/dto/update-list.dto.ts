import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultViewConfigDto } from './view-config.dto';

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
  @ValidateNested()
  @Type(() => DefaultViewConfigDto)
  defaultViewConfig?: DefaultViewConfigDto;
}