import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { MaterialUsage } from './material-usage.entity';
import { MaterialPurchaseHistory } from './material-purchase-history.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  price: number;

  @Column()
  unit: string;

  @Column('float')
  quantityPerUnit: number;

  @OneToMany(() => MaterialUsage, (usage) => usage.material)
  usages: MaterialUsage[];

  @ManyToOne(() => Branch, (branch) => branch.materials)
  branch: Branch;

  @OneToMany(() => MaterialPurchaseHistory, (history) => history.material)
  purchaseHistories: MaterialPurchaseHistory[];
}
