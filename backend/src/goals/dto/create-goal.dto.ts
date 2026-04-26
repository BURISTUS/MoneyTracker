import { IsString, IsInt, Min, IsOptional, IsISO8601 } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  targetAmount: number;

  @IsOptional()
  @IsISO8601()
  deadline?: string;
}
