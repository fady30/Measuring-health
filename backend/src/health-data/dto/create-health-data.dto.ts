import { IsDateString, IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateHealthDataDto {
  @IsUUID()
  deviceId: string;

  @IsInt()
  @Min(0)
  @Max(100000)
  stappen: number;

  @IsInt()
  @Min(0)
  @Max(300)
  hartslag: number;

  @IsNumber()
  @Min(0)
  @Max(24)
  slaapuren: number;

  @IsDateString()
  gemetenOp: string;
}
