// loyalty.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyDto } from './dto/create-loyalty.dto';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post()
  create(@Body() dto: CreateLoyaltyDto) {
    return this.loyaltyService.create(dto);
  }

  @Get(':customerId')
  findByCustomer(@Param('customerId') customerId: number) {
    return this.loyaltyService.findByCustomer(customerId);
  }
}
