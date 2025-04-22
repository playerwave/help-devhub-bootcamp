// 📁 src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const user = await this.userRepository.findOne({
      where: { id: createPaymentDto.userId },
    });

    if (!user) throw new Error('User not found');

    const payment = this.paymentRepository.create({
      amount: createPaymentDto.amount,
      payDate: createPaymentDto.payDate,
      payType: createPaymentDto.payType,
      description: createPaymentDto.description ?? '',
      status: 'pending',
      user,
    });

    return this.paymentRepository.save(payment);
  }

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  remove(id: number) {
    return this.paymentRepository.delete(id);
  }

  // ✅ สำหรับผู้จัดการสาขา: ดึงข้อมูลเฉพาะพนักงานในสาขา
  async findByUserIds(userIds: number[]): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        user: { id: In(userIds) },
      },
      relations: ['user'],
    });
  }

  // ✅ อัปเดตสถานะ payment (approve/reject)
  async updateStatus(
    id: number,
    status: 'approved' | 'rejected',
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    return this.paymentRepository.save(payment);
  }
}
