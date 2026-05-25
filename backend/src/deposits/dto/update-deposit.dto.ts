import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateDepositDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  currentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  annualRate?: number;
}
