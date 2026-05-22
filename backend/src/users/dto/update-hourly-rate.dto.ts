import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHourlyRateDto {
  @ApiProperty({ example: 500, description: 'Hourly rate in rubles' })
  @IsInt()
  @Min(0)
  hourlyRate: number;
}
