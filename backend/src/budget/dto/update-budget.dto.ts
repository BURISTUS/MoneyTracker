import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBudgetDto {
  @ApiProperty({ description: 'New budget amount in kopecks', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;
}
