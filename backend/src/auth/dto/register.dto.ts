import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 500, description: 'Hourly rate in rubles', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ example: 176, description: 'Monthly working hours', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyHours?: number;
}
