import { IsString, IsOptional, MaxLength, MinLength, IsBoolean, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Cash' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includeInTotal?: boolean;

  @ApiPropertyOptional({ example: 50000, description: 'Manual balance correction in kopecks' })
  @IsOptional()
  @IsInt()
  balance?: number;
}
