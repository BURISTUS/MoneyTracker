import { IsString, IsInt, IsOptional, Min, MaxLength, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 'Grocery shopping' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-16T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  date?: string;

  @ApiPropertyOptional({ example: 15000, description: 'Amount in kopecks' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num;
  })
  @IsInt()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ example: 'uuid-account' })
  @IsOptional()
  @IsString()
  accountId?: string;
}
