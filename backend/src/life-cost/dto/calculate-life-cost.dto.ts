import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalculateLifeCostDto {
  @ApiProperty({ example: 15000, description: 'Amount in kopecks' })
  @IsInt()
  @Min(1)
  amount: number;
}
