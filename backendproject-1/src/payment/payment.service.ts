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
    console.log('Create Payment DTO:', createPaymentDto);
    const user = await this.userRepository.findOne({
      where: { id: createPaymentDto.userId },
    });

    if (!user) {
      console.error(`User with ID ${createPaymentDto.userId} not found.`);
      throw new Error('User not found');
    }
    const payment = this.paymentRepository.create({
      amount: createPaymentDto.amount,
      payDate: createPaymentDto.payDate,
      payType: createPaymentDto.payType,
      description: createPaymentDto.description ?? '',
      status: 'pending',
      user,
    });
    console.log('Payment created:', payment);
    return this.paymentRepository.save(payment);
  }

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Payment | null> {
    console.log('Finding payment with ID:', id);
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
    console.log('Finding payments by user IDs:', userIds);
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
    console.log('Updating payment status for ID:', id, 'to:', status);
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      console.error('Payment not found for ID:', id);
      throw new Error('Payment not found');
    }

    payment.status = status;
    console.log('Updated payment:', payment);
    return this.paymentRepository.save(payment);
  }
}
