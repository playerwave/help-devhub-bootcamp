import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  imageUrl?: string; // ✅ เพิ่ม property นี้
}
