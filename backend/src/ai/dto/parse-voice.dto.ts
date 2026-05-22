import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseVoiceDto {
  @ApiProperty({ example: 'Bought coffee for 300 rubles' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  text: string;

  @ApiPropertyOptional({ example: 'ru' })
  @IsOptional()
  @IsString()
  language?: string;
}
