import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { CheckinoutService } from './checkinout.service';
import { CreateCheckinoutDto } from './dto/create-checkinout.dto';

@Controller('checkinout')
export class CheckinoutController {
  constructor(private readonly checkinoutService: CheckinoutService) {}

  @Post('checkin')
  checkIn(@Body() createDto: CreateCheckinoutDto) {
    console.log('[checkIn] DTO ที่รับมา:', createDto);
    return this.checkinoutService.checkIn(createDto);
  }

  @Patch('checkout/:id')
  checkOut(@Param('id') id: string) {
    return this.checkinoutService.checkOut(id);
  }

  @Get('status/:userId')
  getStatus(@Param('userId') userId: string) {
    return this.checkinoutService.getStatus(userId);
  }

  @Get()
  async findAll(@Query('start') start?: string, @Query('end') end?: string) {
    return this.checkinoutService.findAll(start, end);
  }
}
