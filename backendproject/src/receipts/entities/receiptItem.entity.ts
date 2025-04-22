import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Receipt } from './receipt.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class ReceiptItem {
  @PrimaryGeneratedColumn()
  id: number; // Auto-generated primary key for each receipt item

  @Column()
  name: string; // Name of the product in the receipt item

  @Column()
  price: number; // Price of the product in the receipt item

  @Column()
  total: number; // Total price for this receipt item (price * quantity)

  @Column()
  qty: number; // Quantity of the product

  @CreateDateColumn()
  createdAt: Date; // Date and time when this receipt item was created

  @UpdateDateColumn()
  updatedAt: Date; // Date and time when this receipt item was last updated

  @DeleteDateColumn()
  deletedAt: Date; // Date and time when this receipt item was soft deleted

  @ManyToOne(() => Receipt, (receipt) => receipt.items, { onDelete: 'CASCADE' })
  receipt: Receipt; // Relationship to Receipt entity (One Receipt can have many ReceiptItems)

  @ManyToOne(() => Product, (product) => product.receiptItems)
  product: Product; // Relationship to Product entity (Each ReceiptItem is related to one Product)
}
