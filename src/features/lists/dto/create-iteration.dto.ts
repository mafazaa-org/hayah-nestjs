import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateIterationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
