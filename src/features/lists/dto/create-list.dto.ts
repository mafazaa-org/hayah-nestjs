import { IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DefaultViewConfigDto } from './view-config.dto';

export class CreateListDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsOptional()
  @IsString()
  visibility?: 'private' | 'shared';

  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultViewConfigDto)
  defaultViewConfig?: DefaultViewConfigDto;
}