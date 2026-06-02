import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MaxLength(120)
  naam: string;

  @Matches(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)
  macAdres: string;

  @IsString()
  @MaxLength(60)
  firmwareVersie: string;
}
