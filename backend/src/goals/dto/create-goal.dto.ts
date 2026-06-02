import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @MaxLength(60)
  type: string;

  @IsNumber()
  @Min(0)
  streefwaarde: number;

  @IsOptional()
  @IsBoolean()
  actief?: boolean;
}
