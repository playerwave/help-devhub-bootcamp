import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Material } from 'src/material/entities/material.entity';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  location?: string;

  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @OneToMany(() => Material, (material) => material.branch) // ✅ เชื่อมกับ Material
  materials: Material[];
}
