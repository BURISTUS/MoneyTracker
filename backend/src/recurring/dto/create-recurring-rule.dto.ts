import { IsString, IsInt, IsOptional, IsIn, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;
const PERIODS = ['WEEKLY', 'MONTHLY'] as const;

export class CreateRecurringRuleDto {
  @ApiProperty({ example: 'uuid-account' })
  @IsString()
  accountId: string;

  @ApiProperty({ example: 'uuid-category' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 15000, description: 'Amount in kopecks' })
  @Transform(({ value }) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num;
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'EXPENSE', enum: TRANSACTION_TYPES })
  @IsString()
  @IsIn(TRANSACTION_TYPES)
  type: string;

  @ApiProperty({ example: 'MONTHLY', enum: PERIODS })
  @IsString()
  @IsIn(PERIODS)
  period: string;

  @ApiPropertyOptional({ example: 1, description: 'Day of week (1=Mon, 7=Sun). Required for WEEKLY' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: 15, description: 'Day of month (1-31). Required for MONTHLY' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiPropertyOptional({ example: 'Monthly rent payment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
