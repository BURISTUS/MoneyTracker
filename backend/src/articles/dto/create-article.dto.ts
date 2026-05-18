import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateArticleDto {
  @ApiProperty({ example: 'price-of-life' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug: string;

  @ApiProperty({ example: 'Life-Cost' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  tag: string;

  @ApiProperty({ type: [ArticleTranslationDto] })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ArticleTranslationDto)
  translations: ArticleTranslationDto[];
}
