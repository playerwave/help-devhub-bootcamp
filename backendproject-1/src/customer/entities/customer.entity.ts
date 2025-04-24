import { LoyaltyPointHistory } from 'src/loyalty/entities/loyalty-point-history.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Receipt } from 'src/receipts/entities/receipt.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 0 })
  points: number;

  @OneToMany(() => Receipt, (receipt) => receipt.customer)
  receipts: Receipt[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => LoyaltyPointHistory, (history) => history.customer)
  loyaltyPoints: LoyaltyPointHistory[];
}
