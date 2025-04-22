import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaterialUsageDto {
  @Type(() => Number)
  @IsNumber()
  materialId: number;

  @Type(() => Number)
  @IsNumber()
  quantityUsed: number;

  @IsOptional()
  note?: string;
}
