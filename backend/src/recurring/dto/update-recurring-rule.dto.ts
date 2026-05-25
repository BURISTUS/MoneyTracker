import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateRecurringRuleDto {
  @ApiPropertyOptional({ example: 20000, description: 'Amount in kopecks' })
  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num;
  })
  @IsInt()
  amount?: number;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  dayOfMonth?: number;
}
