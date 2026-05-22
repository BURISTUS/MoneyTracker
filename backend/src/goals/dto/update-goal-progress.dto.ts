import { IsInt, Min, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGoalProgressDto {
  @ApiProperty({ example: 25000000, description: 'Contribution amount in kopecks' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'First deposit' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
