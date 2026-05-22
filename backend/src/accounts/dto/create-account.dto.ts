import { IsString, IsOptional, IsIn, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ACCOUNT_TYPES = ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'DEBT'] as const;

export class CreateAccountDto {
  @ApiProperty({ example: 'Cash' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'CASH', enum: ACCOUNT_TYPES })
  @IsString()
  @IsIn(ACCOUNT_TYPES)
  type: string;

  @ApiPropertyOptional({ example: 'RUB' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;
}
