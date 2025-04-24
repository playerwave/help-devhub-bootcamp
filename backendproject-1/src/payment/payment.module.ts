import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module'; // ✅ เพิ่มบรรทัดนี้

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    UsersModule, // ✅ เพิ่มตรงนี้เพื่อใช้ UsersService
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
