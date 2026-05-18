import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinFamilyDto {
  @ApiProperty({ example: 'A1B2C3D4E5F6' })
  @IsString()
  @MinLength(1)
  inviteCode: string;
}
