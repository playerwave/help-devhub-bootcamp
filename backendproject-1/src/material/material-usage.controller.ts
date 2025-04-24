import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MaterialUsageService } from './material-usage.service';
import { CreateMaterialUsageDto } from './dto/create-material-usage.dto'; // ✅ import DTO

@Controller('material-usages')
export class MaterialUsageController {
  constructor(private usageService: MaterialUsageService) {}

  @Post()
  create(@Body() dto: CreateMaterialUsageDto) {
    return this.usageService.createUsage(dto);
  }

  @Get()
  findAll(@Query('materialId') materialId?: number) {
    return this.usageService.findUsage(materialId);
  }
}
