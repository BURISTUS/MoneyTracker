import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseReceiptDto {
  @ApiProperty({ description: 'Base64-encoded image' })
  @IsString()
  @MinLength(1)
  imageBase64: string;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 'ru' })
  @IsOptional()
  @IsString()
  language?: string;
}
