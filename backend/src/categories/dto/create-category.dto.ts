import { IsString, IsOptional, IsIn, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const CATEGORY_TYPES = ['INCOME', 'EXPENSE'] as const;

export class CreateCategoryDto {
  @ApiProperty({ example: 'Coffee' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'EXPENSE', enum: CATEGORY_TYPES })
  @IsString()
  @IsIn(CATEGORY_TYPES)
  type: string;

  @ApiPropertyOptional({ example: 'material:coffee' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ example: '#FF3B30' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBaseNeed?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  excludeFromTotal?: boolean;

  @ApiPropertyOptional({ example: 50000, description: 'Monthly limit in kopecks' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    const num = Number(value);
    if (!Number.isFinite(num)) return value;
    return Math.round(num);
  })
  @IsString()
  monthlyLimit?: number;
}
