import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Checkinout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  checkInTime: Date;

  @Column({ nullable: true })
  checkOutTime: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
