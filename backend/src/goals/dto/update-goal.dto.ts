import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  streefwaarde?: number;

  @IsOptional()
  @IsBoolean()
  actief?: boolean;
}
