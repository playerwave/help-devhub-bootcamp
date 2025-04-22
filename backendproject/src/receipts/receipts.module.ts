import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receiptItem.entity';
import { Product } from 'src/products/entities/product.entity'; // เพิ่มการ import Product
import { Customer } from 'src/customer/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receipt, ReceiptItem, Product, Customer]), // เพิ่ม Product ใน TypeOrmModule
  ],
  providers: [ReceiptsService],
  controllers: [ReceiptsController],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
