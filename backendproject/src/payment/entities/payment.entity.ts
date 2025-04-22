// 📁 src/payment/entities/payment.entity.ts
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  payDate: Date;

  @Column()
  payType: 'daily' | 'monthly';

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'pending' }) // ✅ ใส่ status
  status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
