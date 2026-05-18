import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ArticleTranslationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  language: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @MaxLength(20)
  readTime: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'price-of-life' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ example: 'Life-Cost' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  tag?: string;

  @ApiPropertyOptional({ type: [ArticleTranslationDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ArticleTranslationDto)
  translations?: ArticleTranslationDto[];
}
