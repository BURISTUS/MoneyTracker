import { IsString, IsInt, Min, IsOptional, IsISO8601, IsBoolean } from 'class-validator';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetAmount?: number;

  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
