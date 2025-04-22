import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Material } from './material.entity';

@Entity()
export class MaterialUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  quantityUsed: number;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn({ type: 'datetime' })
  usedAt: Date;

  @ManyToOne(() => Material, (material) => material.usages, {
    eager: true,
    onDelete: 'CASCADE', // ✅ ใส่ตรงนี้เพื่อให้สร้าง foreign key แบบลบตาม
  })
  material: Material;
}
