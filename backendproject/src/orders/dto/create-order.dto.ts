import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ description: 'Id สินค้า', example: 1 })
  @IsNumber()
  @Min(1, { message: 'Product Id must more than 1.' })
  productId: number;
  @ApiProperty({ description: 'จำนวนของสินค้า', example: 1 })
  @IsNumber()
  @Min(1, { message: 'Qty Id must more than 1.' })
  qty: number;
}
export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'รหัสลูกค้า (optional)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Customer Id must be greater than 0.' })
  customerId?: number; // 👈 เพิ่มตรงนี้

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  orderItems: OrderItemDto[];
}
