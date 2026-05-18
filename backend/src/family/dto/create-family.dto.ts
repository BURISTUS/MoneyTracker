import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ example: 'Smith Family' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
