import {
  IsNumber,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceiptItemDto {
  @IsNumber()
  productId: number; // productId จำเป็นต้องมี

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  total: number;

  @IsNumber()
  qty: number;
}

export class CreateReceiptDto {
  @IsNumber()
  totalAmount: number;

  @IsNumber()
  qty: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;
}
