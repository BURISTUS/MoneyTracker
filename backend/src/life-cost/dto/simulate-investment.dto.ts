import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SimulateInvestmentDto {
  @ApiProperty({ example: 15000, description: 'Amount in kopecks' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  years?: number;
}
