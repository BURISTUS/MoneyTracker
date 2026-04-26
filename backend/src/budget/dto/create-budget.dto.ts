import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThreshold?: number;
}
