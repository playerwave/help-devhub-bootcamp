import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { LoyaltyPointHistory } from 'src/loyalty/entities/loyalty-point-history.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total: number;

  @Column()
  qty: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  orderItems: OrderItem[];
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  customer: Customer;

  @OneToMany(() => LoyaltyPointHistory, (history) => history.order)
  pointHistories: LoyaltyPointHistory[];
}
