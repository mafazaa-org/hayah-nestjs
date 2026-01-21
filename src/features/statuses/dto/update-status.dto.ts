import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStatusDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  color?: string | null;
}