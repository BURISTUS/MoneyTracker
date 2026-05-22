import { IsString, IsInt, IsOptional, IsIn, Min, MaxLength, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export class CreateTransactionDto {
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

  @ApiPropertyOptional({ example: 'Grocery shopping' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-16T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  date?: string;
}
