import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateForecastDto {
  @ApiProperty({ example: 'Conservative plan' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 150000, description: 'Monthly income in kopecks' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  monthlyIncome: number;

  @ApiProperty({ example: 80000, description: 'Monthly expenses in kopecks' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  monthlyExpenses: number;

  @ApiPropertyOptional({ example: 70000 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  monthlySave?: number;

  @ApiPropertyOptional({ example: 7.0 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  inflationRate?: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  investmentReturnRate?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsInt()
  forecastYears?: number;
}
