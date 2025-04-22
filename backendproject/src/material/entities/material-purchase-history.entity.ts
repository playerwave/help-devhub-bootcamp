import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Material } from './material.entity';

@Entity()
export class MaterialPurchaseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ แก้ตรงนี้: ลบ inverse relation ออกเพื่อหลีกเลี่ยงการตรวจสอบ property ตอน compile
  @ManyToOne(() => Material)
  material: Material;

  @Column()
  quantityPurchased: number;

  @Column({ nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}
