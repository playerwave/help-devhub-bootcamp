import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
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
  @Min(1, { message: 'Qty must more than 1.' })
  qty: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'รหัสลูกค้า (optional)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Customer Id must be greater than 0.' })
  customerId?: number | null;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  orderItems: OrderItemDto[];

  // ✅ เพิ่ม field นี้เพื่อให้รู้ว่าใช้แต้มหรือไม่
  @ApiPropertyOptional({
    description: 'ใช้แต้มเพื่อแลกฟรีหรือไม่',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  usePoints?: boolean;

  @ApiPropertyOptional({
    description: 'Product ID ที่ต้องการแลกฟรี (optional)',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  freeProductId?: number | null;
}
