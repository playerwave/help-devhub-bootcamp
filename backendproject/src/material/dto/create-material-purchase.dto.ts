import { IsNumber, IsOptional } from 'class-validator';

export class CreateMaterialPurchaseDto {
  @IsNumber()
  materialId: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  note?: string;
}
