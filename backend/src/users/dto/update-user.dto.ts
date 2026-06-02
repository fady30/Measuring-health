import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  naam?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  thema?: string;

  @IsOptional()
  @IsBoolean()
  notificatiesAan?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  dagelijksStappendoel?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  taal?: string;
}
