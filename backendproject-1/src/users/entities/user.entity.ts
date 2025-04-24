import { Branch } from 'src/branch/entities/branch.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '/users-images/unkown.jpg' })
  imageUrl: string;

  @Column()
  login: string;

  @Column({ select: true })
  password: string;

  @Column()
  gender: 'male' | 'female';

  @Column({ default: 20 })
  age: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => Order, (order) => order.user, { cascade: true })
  orders: Order[];

  @ManyToOne(() => Branch, (branch) => branch.users)
  @JoinColumn({ name: 'branchId' }) // 👈 ระบุชื่อคอลัมน์ foreign key ชัดเจน
  branch: Branch;

  @Column({ nullable: true }) // 👈 ทำให้ branchId ใช้ใน select, where ได้
  branchId: number;
}
