// 📁 src/payment/dto/create-payment.dto.ts
export class CreatePaymentDto {
  userId: number;
  amount: number;
  payDate: Date;
  payType: 'daily' | 'monthly';
  description?: string;
}
