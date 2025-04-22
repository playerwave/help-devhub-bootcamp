import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CheckinoutService } from './checkinout.service';
import { CreateCheckinoutDto } from './dto/create-checkinout.dto';

@Controller('checkinout')
export class CheckinoutController {
  constructor(private readonly checkinoutService: CheckinoutService) {}

  @Post('checkin')
  checkIn(@Body() createDto: CreateCheckinoutDto) {
    console.log('[checkIn] DTO ที่รับมา:', createDto);
    return this.checkinoutService.checkIn(createDto); // ❌ ไม่ต้องใช้ await
  }

  @Patch('checkout/:id')
  checkOut(@Param('id') id: string) {
    return this.checkinoutService.checkOut(id); // ❌ ลบ await และ updateDto ออก
  }

  @Get('status/:userId')
  getStatus(@Param('userId') userId: string) {
    return this.checkinoutService.getStatus(userId); // ❌ ไม่ต้องใช้ await
  }
  @Get()
  findAll() {
    return this.checkinoutService.findAll();
  }
}
