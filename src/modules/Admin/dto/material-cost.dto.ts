import { IsString, IsNumber } from 'class-validator';

export class MaterialCostDto {
  @IsString()
  material: string;

  @IsNumber()
  cost: number;
}
