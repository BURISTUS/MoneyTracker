import { IsString, IsInt, IsOptional, IsIn, Min, MaxLength, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const DEPOSIT_TYPES = ['SAVINGS_ACCOUNT', 'TERM_DEPOSIT', 'INVESTMENT', 'BONDS'] as const;
const COMPOUNDING_TYPES = ['DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'NONE'] as const;

export class CreateDepositDto {
  @ApiProperty({ example: 'Sberbank deposit' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'TERM_DEPOSIT', enum: DEPOSIT_TYPES })
  @IsString()
  @IsIn(DEPOSIT_TYPES)
  type: string;

  @ApiProperty({ example: 1000000, description: 'Principal in kopecks' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  principal: number;

  @ApiProperty({ example: 18.5, description: 'Annual rate %' })
  @Transform(({ value }) => Number(value))
  annualRate: number;

  @ApiProperty({ example: 'MONTHLY', enum: COMPOUNDING_TYPES })
  @IsString()
  @IsIn(COMPOUNDING_TYPES)
  compounding: string;

  @ApiProperty({ example: 12 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  termMonths: number;

  @ApiProperty({ example: '2026-01-15' })
  @IsISO8601()
  startDate: string;
}
