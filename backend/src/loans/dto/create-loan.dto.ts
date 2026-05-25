import { IsString, IsInt, IsOptional, IsIn, Min, MaxLength, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const LOAN_TYPES = ['MORTGAGE', 'CONSUMER', 'AUTO', 'STUDENT', 'CREDIT_CARD'] as const;

export class CreateLoanDto {
  @ApiProperty({ example: 'Mortgage' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'MORTGAGE', enum: LOAN_TYPES })
  @IsString()
  @IsIn(LOAN_TYPES)
  type: string;

  @ApiProperty({ example: 5000000, description: 'Principal in kopecks' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  principal: number;

  @ApiProperty({ example: 12.5, description: 'Annual rate %' })
  @Transform(({ value }) => Number(value))
  annualRate: number;

  @ApiProperty({ example: 120 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  termMonths: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsISO8601()
  startDate: string;
}
