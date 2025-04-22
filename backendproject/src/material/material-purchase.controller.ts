import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import { CreateMaterialPurchaseDto } from './dto/create-material-purchase.dto';

@Controller('material-purchases')
export class MaterialPurchaseController {
  constructor(private readonly materialService: MaterialService) {}

  // 🔹 บันทึกการซื้อวัสดุ
  @Post()
  purchaseMaterial(@Body() data: CreateMaterialPurchaseDto) {
    return this.materialService.recordPurchase(
      data.materialId,
      data.quantity,
      data.note,
    );
  }

  // 🔹 ดูประวัติการซื้อทั้งหมด
  @Get()
  getPurchaseHistory(@Query('materialId') materialId?: number) {
    return this.materialService.getPurchaseHistory(materialId);
  }
}
