import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity()
export class LoyaltyPointHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.loyaltyPoints)
  customer: Customer;

  @ManyToOne(() => Order, (order) => order.pointHistories, { nullable: true })
  order: Order;

  @Column()
  points: number;

  @Column({ default: 'earned' })
  type: 'earned' | 'used';

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
