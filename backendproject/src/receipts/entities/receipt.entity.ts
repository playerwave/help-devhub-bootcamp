import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { ReceiptItem } from './receiptItem.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Entity()
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column()
  qty: number;

  @OneToMany(() => ReceiptItem, (item) => item.receipt, { cascade: true })
  items: ReceiptItem[];

  @ManyToOne(() => Customer, (customer) => customer.receipts, {
    nullable: true,
    onDelete: 'SET NULL', // ถ้าลบลูกค้า จะไม่ลบ receipt
  })
  customer?: Customer;

  @CreateDateColumn()
  createdAt: Date; // จะถูกบันทึกอัตโนมัติเมื่อมีการสร้างข้อมูล

  @UpdateDateColumn()
  updatedAt: Date; // จะถูกบันทึกอัตโนมัติเมื่อมีการอัปเดตข้อมูล

  @DeleteDateColumn()
  deletedAt: Date; // จะถูกบันทึกเมื่อมีการลบข้อมูลด้วย soft delete
}
