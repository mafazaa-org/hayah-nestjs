import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSavedSearchDto {
  @IsString()
  name: string;

  @IsString()
  query: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
