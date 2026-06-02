import { IsDateString, IsOptional } from 'class-validator';

export class QueryHealthDataDto {
  @IsOptional()
  @IsDateString()
  van?: string;

  @IsOptional()
  @IsDateString()
  tot?: string;
}
