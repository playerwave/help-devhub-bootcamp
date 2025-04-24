// loyalty.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoyaltyDto } from './dto/create-loyalty.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';
import { LoyaltyPointHistory } from './entities/loyalty-point-history.entity';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyPointHistory)
    private readonly loyaltyRepo: Repository<LoyaltyPointHistory>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(dto: CreateLoyaltyDto) {
    const customer = await this.customerRepo.findOneByOrFail({
      id: dto.customerId,
    });

    const loyalty = this.loyaltyRepo.create({
      customer,
      points: dto.points,
      type: dto.type,
      description: dto.description,
    });

    if (dto.orderId) {
      const order = await this.orderRepo.findOneBy({ id: dto.orderId });
      if (order) {
        loyalty.order = order;
      }
    }

    const saved = await this.loyaltyRepo.save(loyalty);

    // อัปเดตคะแนนสะสมของลูกค้า (รวมทั้งหมด)
    if (dto.type === 'earned') customer.points += dto.points;
    if (dto.type === 'used') customer.points -= dto.points;
    await this.customerRepo.save(customer);

    return saved;
  }

  findByCustomer(customerId: number) {
    return this.loyaltyRepo.find({
      where: { customer: { id: customerId } },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }
}
