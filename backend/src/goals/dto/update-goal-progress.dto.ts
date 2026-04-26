import { IsInt, Min } from 'class-validator';

export class UpdateGoalProgressDto {
  @IsInt()
  @Min(1)
  amount: number;
}
