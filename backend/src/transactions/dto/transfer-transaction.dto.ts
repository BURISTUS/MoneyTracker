import { IsString, IsInt, IsOptional, Min, MaxLength, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TransferTransactionDto {
  @ApiProperty({ example: 'uuid-from-account' })
  @IsString()
  fromAccountId: string;

  @ApiProperty({ example: 'uuid-to-account' })
  @IsString()
  toAccountId: string;

  @ApiProperty({ example: 15000, description: 'Amount in kopecks' })
  @Transform(({ value }) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return num;
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'Transfer to card' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-16T12:00:00Z' })
  @IsOptional()
  @IsISO8601()
  date?: string;
}
