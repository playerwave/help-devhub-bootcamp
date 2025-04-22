// 📁 src/payment/payment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/auth/roles/roles.enum';
import { UsersService } from 'src/users/users.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  async getPayments(): Promise<Payment[]> {
    return this.paymentService.findAll();
  }

  @Get(':id')
  async getPayment(@Param('id') id: number): Promise<Payment | null> {
    return this.paymentService.findOne(id);
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: number) {
    return this.paymentService.remove(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.STAFF)
  @Get('/my')
  async getMyPayments(@Req() request): Promise<Payment[]> {
    const userId = request.user.id;
    return this.paymentService.findByUserIds([userId]);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.MANAGER)
  @Get('/branch/payments')
  async getPaymentsByBranch(@Req() request): Promise<Payment[]> {
    const branchId = request.user.branchId;
    const users = await this.usersService.findByBranch(branchId);
    const userIds = users.map((u) => u.id);
    return this.paymentService.findByUserIds(userIds);
  }

  @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.MANAGER)
  @Patch(':id')
  async updatePaymentStatus(
    @Param('id') id: number,
    @Body() body: { status: 'approved' | 'rejected' },
    @Req() request,
  ): Promise<Payment> {
    console.log('🧾 PATCH by user:', request.user); // ✅ เช็คว่า JWT มาไหม
    return this.paymentService.updateStatus(id, body.status);
  }
}
