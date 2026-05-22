import { IsString, IsOptional, IsISO8601, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const PLANS = ['premium', 'premium_family'] as const;

export class ActivateSubscriptionDto {
  @ApiPropertyOptional({ example: 'premium', enum: PLANS })
  @IsOptional()
  @IsString()
  @IsIn(PLANS)
  plan?: string;

  @ApiPropertyOptional({ example: 'apple' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ example: 'txn_123' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
