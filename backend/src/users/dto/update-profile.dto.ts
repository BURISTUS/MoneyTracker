import { IsString, IsOptional, IsInt, Min, MaxLength, MinLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const SUPPORTED_LANGUAGES = [
  'en', 'ru', 'es', 'pt', 'fr', 'de', 'ja', 'zh',
  'ar', 'hi', 'ko', 'it', 'tr', 'vi', 'id', 'th',
  'pl', 'uk', 'nl', 'bn',
] as const;

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 176 })
  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyHours?: number;

  @ApiPropertyOptional({ example: 'RUB' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_LANGUAGES)
  language?: string;
}
